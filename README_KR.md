# PLA Melt/MVS Calibrator v21 Firmware Auto + Unknown + Bed Override

v21 수정:
- 기종 변수 바로 아래에 firmware_mode 선택 변수 추가.
- 선택지: `klipper`, `marlin`, `bambu`, `unknown`.
- 프린터 프리셋 선택 시 firmware_mode 자동 추정.
- 프리뷰에 firmware mode 표시.
- `unknown`이면 가속/속도 제한 해제 코드를 G-code에 넣지 않음.
- `unknown`이면 변수창 바로 아래 경고 표시:
  - `가속/속도제한이 해제되지 않았을 수 있습니다`
- 빌드볼륨 수동입력 추가:
  - `bed_x`
  - `bed_y`

이전 버전에는 빌드볼륨 수동입력은 없었고, `square_x / square_y / circle_diameter` 배치 오버라이드만 있었다. v21부터 bed_x/bed_y 직접 입력 가능.

# PLA Melt/MVS Calibrator v20 Firmware Modes

v20 수정:
- UI에 Firmware Motion 섹션 추가.
- firmware_mode 선택:
  - `klipper`
  - `marlin`
  - `bambu`
- 선택값에 따라 시작 G-code motion hint가 다르게 들어감.
- 기본값은 U1 기준 `klipper`.

## Klipper 모드

```gcode
SET_VELOCITY_LIMIT VELOCITY=300 ACCEL=8000 MINIMUM_CRUISE_RATIO=0 SQUARE_CORNER_VELOCITY=10
M204 S8000
M220 S100
```

## Marlin 모드

```gcode
M203 X300 Y300 Z20 E80
M201 X8000 Y8000 Z300 E5000
M204 S8000
M204 P8000 T8000
M205 X10 Y10 Z0.4 E5
M220 S100
```

## Bambu 모드

```gcode
M204 S8000
M204 P8000 T8000
M220 S100
```

주의:
- Bambu 순정 펌웨어는 Klipper가 아니므로 SET_VELOCITY_LIMIT를 넣지 않는다.
- Marlin/ Bambu에서 M500 저장은 넣지 않는다. 테스트 G-code가 EEPROM을 건드리지 않게 하기 위해서다.

# PLA Melt/MVS Calibrator v19 Boustrophedon Label → Seam

v19 수정:
- 라벨 출력 순서 변경:
  - 1줄: 왼쪽 → 오른쪽
  - 2줄: 오른쪽 → 왼쪽
  - 3줄: 왼쪽 → 오른쪽
- 글자를 읽는 순서대로만 쓰지 않고, 줄마다 방향을 바꿔 연결선 겹침을 줄임.
- 라벨 출력이 끝나면 압출을 끊지 않고 seam / 0% MVS 지점으로 G1 연결.
- seam 지점에서 바로 원형 출력물 1레이어를 시작.
- 프리뷰에서도 label → seam 연결선을 표시.

## 유지 사항

```text
stroke width = 0.6mm
connector width = 0.2mm
always standalone
G28 first
right preview UI
```

# PLA Melt/MVS Calibrator v18 Width Defaults

v18 수정:
- 기본 글자 stroke 폭: `0.6mm`
- 기본 글자/획/줄 연결선 connector 폭: `0.2mm`
- UI 기본값과 생성기 기본값 둘 다 변경.

주의:
- 0.4mm 노즐 기준으로 `0.6mm` stroke는 대체로 무난하다.
- `0.2mm` connector는 안정적이라고 보기 어렵다.
- 아주 짧은 연결선이라서 통과될 수도 있지만, 환경에 따라 끊김/간헐적 미압출/형상 불안정이 생길 수 있다.
- 실사용 안정성 우선이면 connector는 `0.28 ~ 0.35mm`가 더 낫다.

## 실행

```powershell
py -3 .\melt_mvs_calibrator_ui.py
```

콘솔 없이:

```text
run_ui_no_cmd.bat
```

# PLA Melt/MVS Calibrator v17 Wide Preview UI

v17 수정:
- UI 글씨 크기 대폭 확대.
- 기본 창 비율 16:9.
- 화면의 약 3/4 크기로 시작.
- 왼쪽 1/3: 변수 입력.
- 오른쪽 2/3: 베드/출력물/바닥글씨 프리뷰.
- 프리뷰가 하단에서 오른쪽 메인 영역으로 이동.
- always standalone / G28 first 유지.

## 실행

```powershell
py -3 .\melt_mvs_calibrator_ui.py
```

콘솔 없이:

```text
run_ui_no_cmd.bat
```

# PLA Melt/MVS Calibrator v16 Always Standalone

v16 수정:
- UI에서 standalone 옵션 제거.
- 생성기는 무조건 standalone G-code 생성.
- G-code 시작부에서 `G28`을 먼저 실행.
- 그 다음 베드/노즐 가열 및 대기.
- 하단 2D 프리뷰 유지.

주의:
- 매 출력마다 홈을 다시 잡는다.
- 베드 위에 출력물/클립/장애물이 있으면 충돌 위험이 있으니 비운 상태에서 출력해야 한다.
- 프린터 고유 START_PRINT 매크로가 필요한 장비에서는 나중에 별도 start macro 옵션을 추가하는 게 더 좋다.

## 실행

```powershell
py -3 .\melt_mvs_calibrator_ui.py
```

또는:

```text
run_ui.bat
```

콘솔 없이:

```text
run_ui_no_cmd.bat
```

# PLA Melt/MVS Calibrator v15 UI Preview

v15 수정:
- 하단 2D 프리뷰 추가.
- Preview 버튼 추가.
- Generate 후 자동으로 프리뷰 갱신.
- 프리뷰는 임시/생성 G-code의 라벨 G1 경로를 직접 파싱해서 그림.
- 베드, 배치 사각형, 원형 출력물, seam, 바닥글씨 stroke/connector 표시.
- stroke는 두껍게, connector는 얇게 표시.

## 실행

```powershell
py -3 .\melt_mvs_calibrator_ui.py
```

또는 콘솔창 없이:

```text
run_ui_no_cmd.bat
```

일반 실행:

```text
run_ui.bat
```

## 프리뷰 색상

```text
흰색 계열: 실제 글씨 stroke
파란색 계열: 글자/획/줄 연결선 connector
회색: 베드/원형 출력물
노란색: seam / 0% MVS
```

# PLA Melt/MVS Calibrator v14 UI

v14 수정:
- 바닥 라벨의 `mm^3/s` 표기를 `mm³/s`로 변경.
- txt.shx식 라벨 폰트에 `³` 글리프 추가.
- `³`는 일반 3이 아니라 작은 글자로 위쪽에 배치된다.

예시 라벨:

```text
MAX MVS:20mm³/s
```

# PLA Melt/MVS Calibrator v13 UI

v13 UI 수정:
- UI 글씨 포인트 줄임.
- 변수명/설명 텍스트가 위아래로 잘리지 않도록 레이아웃 수정.
- `bands` 입력칸 제거.
- `start_temp`, `end_temp`, `temp_step`으로 bands 자동 계산.
- 계산식: `(start_temp - end_temp) / temp_step + 1`, 나누어떨어지지 않으면 올림.

## 실행

```powershell
py -3 .\melt_mvs_calibrator_ui.py
```

또는:

```text
run_ui.bat
```

## 예시

```text
start_temp = 230
end_temp = 176
temp_step = 1
=> bands = 55
```

# PLA Melt/MVS Calibrator v12 UI

v12는 v11 생성기에 Windows용 Tkinter UI를 추가한 버전이다.

## UI 실행

압축을 풀고 폴더 안에서:

```powershell
py -3 .\melt_mvs_calibrator_ui.py
```

또는:

```text
run_ui.bat
```

UI 형태:
- 회색 바탕
- 변수명 표시
- 작은 설명글
- 입력칸/체크박스/프리셋 선택
- Generate G-code 버튼

## 생성기 직접 실행

```powershell
py -3 .\melt_mvs_calibrator_v11.py --printer-preset SNAPMAKER_U1 -o U1_v11.gcode
```

# PLA Melt Limit + In-layer MVS Ramp Calibrator v11

v11 핵심:
- txt.shx식 multi-stroke 라벨 유지.
- 실제 글씨 stroke와 연결선 connector의 압출폭을 분리.
- 실제 글씨 stroke: 기본 0.8mm
- 연결선 connector: 기본 0.4mm
- G-code에서는 선폭 명령이 따로 있는 게 아니라, 구간별 E값을 다른 선폭 기준으로 계산한다.

## 실행

```powershell
py -3 .\melt_mvs_calibrator_v11.py --printer-preset SNAPMAKER_U1 -o U1_v11.gcode
```

## 폭 조절

```powershell
py -3 .\melt_mvs_calibrator_v11.py --printer-preset SNAPMAKER_U1 --label-stroke-width 0.8 --label-connector-width 0.4 -o U1_v11.gcode
```

## 라벨 주석

```gcode
; label_width_mode=stroke_vs_connector
; label_stroke_width=0.8
; label_connector_width=0.4
```

주의:
- 0.4mm 노즐에서 0.8mm 선폭은 가능하지만 느리게 출력하는 게 낫다.
- 기본 label_speed는 20mm/s.
