import bpy
import sys

# シーンをクリア
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# 簡単な兎のモデルを作成
# 体（楕円体）
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 1))
body = bpy.context.active_object
body.scale = (0.8, 1.2, 1)

# 頭（球）
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.6, location=(0, 0, 2.2))
head = bpy.context.active_object

# 左耳
bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=1.2, location=(-0.3, -0.2, 3))
left_ear = bpy.context.active_object
left_ear.rotation_euler = (0.3, 0, -0.2)

# 右耳
bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=1.2, location=(0.3, -0.2, 3))
right_ear = bpy.context.active_object
right_ear.rotation_euler = (0.3, 0, 0.2)

# 左足
bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=0.8, location=(-0.4, 0.5, 0.4))
left_leg = bpy.context.active_object

# 右足
bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=0.8, location=(0.4, 0.5, 0.4))
right_leg = bpy.context.active_object

# しっぽ
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.25, location=(0, 1, 0.8))
tail = bpy.context.active_object

# マテリアルを追加（白い兎）
mat = bpy.data.materials.new(name="RabbitMaterial")
mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.95, 0.95, 0.95, 1)  # 白色

# すべてのオブジェクトにマテリアルを適用
for obj in [body, head, left_ear, right_ear, left_leg, right_leg, tail]:
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

# すべてを選択して結合
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()

# GLB形式でエクスポート
output_path = sys.argv[-1]
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=False
)

print(f"モデルを保存しました: {output_path}")
