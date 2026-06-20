import cv2
import mediapipe as mp
import math
import time

# -----------------------------
# MediaPipe 初期化
# -----------------------------
mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True
)

# -----------------------------
# カメラ起動
# -----------------------------
cap = cv2.VideoCapture(0)

# 左目ランドマーク
LEFT_EYE = [33, 160, 158, 133, 153, 144]

# -----------------------------
# 距離計算
# -----------------------------
def distance(a, b):
    return math.sqrt(
        (a.x - b.x) ** 2 +
        (a.y - b.y) ** 2
    )

# -----------------------------
# EAR計算
# -----------------------------
def calc_ear(landmarks, eye):

    p1 = landmarks[eye[0]]
    p2 = landmarks[eye[1]]
    p3 = landmarks[eye[2]]
    p4 = landmarks[eye[3]]
    p5 = landmarks[eye[4]]
    p6 = landmarks[eye[5]]

    vertical = distance(p2, p6) + distance(p3, p5)
    horizontal = 2.0 * distance(p1, p4)

    return vertical / horizontal

# -----------------------------
# 初期設定
# -----------------------------
blink_count = 0
blink_flag = False

# 瞬き時刻保存
blink_times = []

# 開始時刻
start_time = time.time()

# 初期平均
baseline_bpm = 15

# EAR閾値
EAR_THRESHOLD = 0.20

# 判定余裕
margin = 3

# -----------------------------
# メインループ
# -----------------------------
while True:

    ret, frame = cap.read()

    if not ret:
        break

    # 左右反転
    frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = face_mesh.process(rgb)

    current_time = time.time()
    elapsed_time = current_time - start_time

    if results.multi_face_landmarks:

        landmarks = results.multi_face_landmarks[0].landmark

        # EAR計算
        ear = calc_ear(landmarks, LEFT_EYE)

        # -----------------------------
        # 瞬き判定
        # -----------------------------
        if ear < EAR_THRESHOLD:

            if not blink_flag:

                blink_count += 1
                blink_flag = True

                blink_times.append(current_time)

        else:
            blink_flag = False

        # -----------------------------
        # 60秒より前を削除
        # -----------------------------
        blink_times = [
            t for t in blink_times
            if current_time - t <= 60
        ]

        # -----------------------------
        # 平均瞬き回数
        # -----------------------------
        if elapsed_time > 0:
            measured_avg = (blink_count / elapsed_time) * 60
        else:
            measured_avg = baseline_bpm

        # 起動直後は15回に寄せる
        if elapsed_time < 120:
            avg_bpm = (baseline_bpm + measured_avg) / 2
        else:
            avg_bpm = measured_avg

        # -----------------------------
        # 直近1分
        # -----------------------------
        recent_blinks = len(blink_times)

        # -----------------------------
        # 状態判定
        # -----------------------------
        if recent_blinks > avg_bpm + margin:
            state = "Stress?"
        elif recent_blinks < avg_bpm - margin:
            state = "Hyperfocus / Fatigue?"
        else:
            state = "Normal"

        # -----------------------------
        # 表示
        # -----------------------------
        cv2.putText(
            frame,
            f"Total Blinks: {blink_count}",
            (30, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            f"Average BPM: {avg_bpm:.1f}",
            (30, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            f"Last 1 min: {recent_blinks}",
            (30, 150),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            f"State: {state}",
            (30, 200),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

        cv2.putText(
            frame,
            f"EAR: {ear:.2f}",
            (30, 250),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 0),
            2
        )

    # -----------------------------
    # 画面表示
    # -----------------------------
    cv2.imshow("Blink Monitor", frame)

    # ESCで終了
    if cv2.waitKey(1) & 0xFF == 27:
        break

# -----------------------------
# 終了処理
# -----------------------------
cap.release()
cv2.destroyAllWindows()