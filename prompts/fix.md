메뉴 추천 카드 렌더링
POST /menu/recommend 결과를 상태에 저장 (historyId = response.id, recommendedMenus = response.recommendations)
카드에는 메뉴 목록과 historyId를 함께 보관
메뉴별 AI 가게 추천 버튼
버튼 클릭 시, 로컬 상태에서 해당 메뉴가 이미 추천됐는지 먼저 확인
요청 예시:
>
     GET /menu/recommend/places?query=<prompt>&historyId=<response.id>&menuName=<선택 메뉴>
400 응답(이미 추천받음)일 경우 “이미 추천받은 메뉴입니다” 안내만 띄우고 추가 요청 중단
추천 결과 표시
방금 받은 recommendations[]를 바로 UI에 추가하거나
/menu/recommendations/:historyId 호출로 저장된 전체 places[]를 가져와서
menuName을 소제목으로 가게 카드 리스트 렌더링