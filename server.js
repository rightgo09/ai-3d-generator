import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 生成されたモデルを配信
app.use('/models', express.static(path.join(__dirname, 'models')));

// モデル一覧を取得するAPI
app.get('/api/models', async (req, res) => {
  try {
    const files = await fs.readdir(path.join(__dirname, 'models'));
    const glbFiles = files.filter(f => f.endsWith('.glb'));
    res.json({ models: glbFiles });
  } catch (error) {
    res.json({ models: [] });
  }
});

// モデル生成エンドポイント
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'プロンプトが必要です' });
  }

  try {
    console.log(`プロンプトを受信: ${prompt}`);

    // 1. Gemini APIを呼び出してBlender Pythonスクリプトを生成
    const blenderScript = await generateBlenderScript(prompt);
    console.log('Blenderスクリプトを生成しました');

    // 2. スクリプトをファイルに保存
    const scriptPath = path.join(__dirname, 'temp_script.py');
    await fs.writeFile(scriptPath, blenderScript);

    // 3. Blenderを実行してGLBファイルを生成
    const modelFilename = `model_${Date.now()}.glb`;
    const modelPath = path.join(__dirname, 'models', modelFilename);

    await runBlender(scriptPath, modelPath);

    // ファイルが生成されたか確認
    try {
      await fs.access(modelPath);
      console.log(`モデルを生成しました: ${modelFilename}`);
    } catch (e) {
      console.error(`モデルファイルが生成されませんでした: ${modelPath}`);
      // スクリプトの内容をログに出力
      const scriptContent = await fs.readFile(scriptPath, 'utf-8');
      console.error('生成されたスクリプト:\n', scriptContent);
      throw new Error('Blenderがモデルファイルを生成できませんでした');
    }

    // 4. 一時ファイルを削除
    await fs.unlink(scriptPath);

    // 5. モデルのURLを返す
    res.json({
      success: true,
      modelUrl: `/models/${modelFilename}`,
      message: 'モデルの生成に成功しました'
    });

  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({
      error: 'モデルの生成に失敗しました',
      details: error.message
    });
  }
});

// Gemini APIを呼び出してBlenderスクリプトを生成
async function generateBlenderScript(prompt) {
  const systemPrompt = `あなたはBlender 5.0 Pythonスクリプトの専門家です。
ユーザーのプロンプトに基づいて、3Dモデルを生成するBlenderスクリプトを作成してください。

以下のサンプルコードを参考にしてください:

\`\`\`python
import bpy
import sys

# シーンをクリア（この方法を必ず使用）
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# 体（球）
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 1))
body = bpy.context.active_object

# マテリアルを追加（シンプルな方法）
mat = bpy.data.materials.new(name="Material")
mat.diffuse_color = (0.8, 0.2, 0.2, 1)  # RGBA色
body.data.materials.append(mat)

# GLB形式でエクスポート
output_path = sys.argv[-1]
bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLB', use_selection=False)
\`\`\`

重要なルール:
- bpy.ops.wm.reinit() は使用禁止（存在しない）
- シーンクリアは必ず bpy.ops.object.select_all(action='SELECT') と bpy.ops.object.delete() を使用
- 出力パスは必ず sys.argv[-1] から取得
- プリミティブは primitive_cube_add, primitive_uv_sphere_add, primitive_cylinder_add を使用
- マテリアルは mat.diffuse_color = (R, G, B, A) を使用。use_nodes や Principled BSDF は使用禁止

Pythonコードのみを返してください。説明は不要です。コードブロック(\`\`\`python)で囲んでください。`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\n${prompt}の3Dモデルを作成するBlenderスクリプトを生成してください。` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini API error body:', errorBody);
    throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;

  // コードブロックから抽出
  const match = content.match(/```python\n([\s\S]*?)\n```/) ||
                content.match(/```\n([\s\S]*?)\n```/);

  return match ? match[1] : content;
}

// Blenderを実行
function runBlender(scriptPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Blenderのパスを確認
    const blenderCommand = 'blender'; // システムのPATHにBlenderがある場合

    const args = [
      '--background',
      '--python', scriptPath,
      '--', outputPath
    ];

    const blenderProcess = spawn(blenderCommand, args);

    let stderr = '';

    blenderProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    blenderProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Blender exited with code ${code}: ${stderr}`));
      }
    });

    blenderProcess.on('error', (error) => {
      reject(new Error(`Blenderの実行に失敗: ${error.message}`));
    });
  });
}

// modelsディレクトリを作成
const modelsDir = path.join(__dirname, 'models');
await fs.mkdir(modelsDir, { recursive: true });

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log('Blenderがインストールされていることを確認してください');
});
