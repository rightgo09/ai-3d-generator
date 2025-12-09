import bpy
import sys

# シーンをクリア
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# --- ロボットのパーツ ---

# 頭 (球)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(0, 0, 2.5))
head = bpy.context.active_object
head.name = "RobotHead"

# 体 (円柱)
bpy.ops.mesh.primitive_cylinder_add(radius=0.7, depth=1.5, location=(0, 0, 1))
body = bpy.context.active_object
body.name = "RobotBody"

# 左腕 (円柱)
bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=1, location=(-1.2, 0, 1.5))
left_arm = bpy.context.active_object
left_arm.name = "RobotLeftArm"
left_arm.rotation_euler = (0, 0.5, 0)

# 右腕 (円柱)
bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=1, location=(1.2, 0, 1.5))
right_arm = bpy.context.active_object
right_arm.name = "RobotRightArm"
right_arm.rotation_euler = (0, -0.5, 0)

# 左脚 (円柱)
bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=1.2, location=(-0.5, 0, 0))
left_leg = bpy.context.active_object
left_leg.name = "RobotLeftLeg"

# 右脚 (円柱)
bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=1.2, location=(0.5, 0, 0))
right_leg = bpy.context.active_object
right_leg.name = "RobotRightLeg"

# --- マテリアル ---

# ロボット全体のマテリアル（シンプルな方法）
robot_mat = bpy.data.materials.new(name="RobotMaterial")
robot_mat.diffuse_color = (0.4, 0.4, 0.8, 1)  # 青っぽい色（RGBA）

# 各パーツにマテリアルを適用
head.data.materials.append(robot_mat)
body.data.materials.append(robot_mat)
left_arm.data.materials.append(robot_mat)
right_arm.data.materials.append(robot_mat)
left_leg.data.materials.append(robot_mat)
right_leg.data.materials.append(robot_mat)


# --- エクスポート ---
output_path = sys.argv[-1]
bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLB', use_selection=False)
print(f"モデルを保存しました: {output_path}")
