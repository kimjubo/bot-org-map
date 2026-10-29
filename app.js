"use strict";

const ACCESS = [
  { id: "drive", group: "conn", name: "Drive", blurb: "파일 읽기와 쓰기. 게시가 아니다." },
  { id: "gmail", group: "conn", name: "Gmail", blurb: "초안과 정리. 발송은 주보 님 승인." },
  { id: "calendar", group: "conn", name: "Calendar", blurb: "일정." },
  { id: "slack", group: "conn", name: "Slack", blurb: "방 밖 알림. 봇끼리 본문은 방과 공유 메모리." },
  { id: "x", group: "conn", name: "X", blurb: "공개 글 확인. 게시는 승인 후 홍보봇." },
  { id: "github", group: "conn", name: "GitHub", blurb: "저장소와 웹. 배포는 승인." },
  { id: "web", group: "tool", name: "웹", blurb: "공개 페이지를 읽는다." },
  { id: "imagine", group: "tool", name: "그록 이매진", blurb: "래스터 생성. 비트맵봇만. 원고 전문은 넣지 않는다." }
];

const EXTERNAL = [
  { id: "claude", name: "Claude API", mark: "선불", blurb: "유료. 미발표 원고를 맡겨도 된다.", tone: "blue" },
  { id: "openrouter", name: "OpenRouter", mark: "무료", blurb: "공개된 자료만. 미발표 원고 금지.", tone: "red" },
  { id: "cursor", name: "Cursor 클라우드", mark: "개발", blurb: "개발봇의 웹 작업.", tone: "ink" }
];

const FOLDERS = [
  { code: "00", id: "folder-00", name: "00.하늘그네", summary: "산출물, 간단 보고서, 대화 텍스트." },
  { code: "01", id: "folder-01", name: "01.결정_진행표", summary: "결정과 지금 단계." },
  { code: "02", id: "folder-02", name: "02.실수_기록", summary: "틀린 것, 원인, 다음에 막을 방법." }
];

const BOTS = [
  {
    id: "owner",
    name: "주보 님",
    mark: "소유",
    role: "소유자",
    summary: "방향을 정하고, 되돌리기 어려운 일을 승인한다.",
    kindLabel: "사람",
    tone: "red",
    fill: true,
    shape: "circle",
    parent: null,
    access: [],
    external: [],
    folders: [],
    memory: false,
    rules: [
      "메일 발송, 삭제, 결제, 제출, 배포는 여기서 승인한다.",
      "담당이 분명하면 봇이 진행하고, 애매하면 비서실장이 올린다."
    ]
  },
  {
    id: "chief",
    name: "비서실장",
    mark: "지휘",
    role: "지휘",
    summary: "일을 받아 나누고, 검토를 돌리고, 끝나면 보고한다.",
    kindLabel: "지휘",
    tone: "blue",
    fill: true,
    parent: "owner",
    access: ["drive", "gmail", "calendar", "slack"],
    external: ["claude"],
    folders: ["00", "01", "02"],
    memory: true,
    rules: [
      "나누기 전에 완료기준과 가정을 적는다.",
      "봇에게 보낼 때는 결론 1줄과 링크, 3줄 이하.",
      "검토 루프는 최대 2회. 넘으면 보고하고 멈춘다.",
      "메일은 초안까지. 발송하지 않는다.",
      "끝나거나 막히면 간단 보고서와 대화 텍스트를 Drive에 넣는다."
    ]
  },
  {
    id: "multi",
    name: "다목적봇",
    mark: "실무",
    role: "보조 실무",
    summary: "분류, 체크리스트, 진행표와 잡무.",
    kindLabel: "봇",
    tone: "ink",
    parent: "chief",
    access: ["drive", "calendar", "slack"],
    external: [],
    folders: ["00", "01", "02"],
    memory: true,
    rules: [
      "전문 글, 그림, 판정은 그 봇에게 넘긴다.",
      "정확한 규칙은 체크리스트로 적는다.",
      "진행은 01.결정_진행표, 실수는 02.실수_기록."
    ]
  },
  {
    id: "grok",
    name: "Grok Bot",
    mark: "지원",
    role: "밀린 일 지원",
    summary: "밀린 일과 공개된 자료 조사.",
    kindLabel: "봇",
    tone: "ink",
    parent: "chief",
    access: ["web", "x"],
    external: ["openrouter"],
    folders: [],
    memory: true,
    rules: [
      "미발표 원고는 받지 않는다. 무료 AI 구간이다.",
      "결과는 결론 1줄과 링크."
    ]
  },
  {
    id: "promo",
    name: "홍보봇",
    mark: "홍보",
    role: "카피·응모 문안·검수",
    summary: "문장을 다듬고, 통과면 통과 한 단어만 돌려준다.",
    kindLabel: "봇",
    tone: "red",
    parent: "chief",
    access: ["drive", "x"],
    external: ["claude"],
    folders: ["00"],
    memory: true,
    rules: [
      "통과 신호는 통과 한 단어.",
      "게시, 배포, 제출은 주보 님 승인 전에 하지 않는다.",
      "Drive와 X만 쓴다."
    ]
  },
  {
    id: "writer",
    name: "작가봇",
    mark: "글",
    role: "글·콘티",
    summary: "초안과 콘티를 쓰고 Drive에 둔다.",
    kindLabel: "봇",
    tone: "red",
    parent: "chief",
    access: ["drive"],
    external: ["claude"],
    folders: ["00"],
    memory: true,
    rules: [
      "산출물은 00.하늘그네.",
      "미발표 원고는 무료 AI 금지. 선불 Claude만.",
      "초안 다음은 수사봇."
    ]
  },
  {
    id: "invest",
    name: "수사봇",
    mark: "수사",
    role: "사실 확인",
    summary: "웹과 X의 원문을 보고 네 가지 중 하나로 판정한다.",
    kindLabel: "봇",
    tone: "blue",
    parent: "chief",
    access: ["web", "x"],
    external: [],
    folders: [],
    memory: true,
    rules: [
      "판정은 사실, 일부사실, 미확인, 오도 중 하나.",
      "근거는 원문 링크. 판정을 다른 AI에 맡기지 않는다.",
      "웹과 X만."
    ]
  },
  {
    id: "news",
    name: "뉴스봇",
    mark: "뉴스",
    role: "뉴스·공모 공고",
    summary: "원문 링크, 자격, 마감, 제출처를 가져온다.",
    kindLabel: "봇",
    tone: "blue",
    parent: "chief",
    access: ["web", "x"],
    external: ["openrouter"],
    folders: [],
    memory: true,
    rules: [
      "해석하지 않고 작가봇, 홍보봇으로 넘긴다.",
      "무료 AI에는 이미 공개된 자료만."
    ]
  },
  {
    id: "dev",
    name: "개발봇",
    mark: "개발",
    role: "웹 개발",
    summary: "GitHub와 웹, 구현은 Cursor 클라우드 에이전트.",
    kindLabel: "봇",
    tone: "yellow",
    parent: "chief",
    access: ["github", "web", "drive"],
    external: ["cursor"],
    folders: ["00"],
    memory: true,
    rules: [
      "배포는 주보 님 승인.",
      "키와 비밀번호는 저장소와 채팅에 넣지 않는다."
    ]
  },
  {
    id: "video",
    name: "영상봇",
    mark: "영상",
    role: "영상 감독",
    summary: "콘티는 작가봇, 컷은 아트봇, 파일은 Drive.",
    kindLabel: "봇",
    tone: "yellow",
    parent: "chief",
    access: ["drive"],
    external: [],
    folders: ["00"],
    memory: true,
    rules: [
      "공개 업로드는 배포라서 승인 대상.",
      "파일은 Drive."
    ]
  },
  {
    id: "comment",
    name: "논평봇",
    mark: "논평",
    role: "논평",
    summary: "의견이라고 밝히고, 사실 판단은 수사봇에 맡긴다.",
    kindLabel: "봇",
    tone: "red",
    parent: "chief",
    access: ["drive", "web"],
    external: ["claude"],
    folders: ["00"],
    memory: true,
    rules: [
      "논평은 의견이라고 표시한다.",
      "사실 판단은 수사봇.",
      "미발표 원고는 무료 AI 금지."
    ]
  },
  {
    id: "art",
    name: "아트봇 팀장",
    mark: "아트",
    role: "그림 분배",
    summary: "장면과 질감은 비트맵, 로고와 선은 벡터.",
    kindLabel: "봇",
    tone: "yellow",
    parent: "chief",
    access: ["drive"],
    external: [],
    folders: ["00"],
    memory: true,
    rules: [
      "직접 생성하지 않고 비트맵봇 또는 벡터봇으로 나눈다.",
      "공개 전에 배포 승인이 필요하면 비서실장에게 올린다."
    ]
  },
  {
    id: "bitmap",
    name: "비트맵봇",
    mark: "래스터",
    role: "래스터·그록 이매진",
    summary: "질감과 장면을 픽셀로 만든다.",
    kindLabel: "봇",
    tone: "yellow",
    parent: "art",
    access: ["drive", "imagine"],
    external: [],
    folders: ["00"],
    memory: true,
    rules: [
      "도구는 그록 이매진.",
      "그림 지시만 넣는다. 미발표 원고 전문은 넣지 않는다.",
      "결과 파일은 Drive."
    ]
  },
  {
    id: "vector",
    name: "벡터봇",
    mark: "SVG",
    role: "SVG",
    summary: "로고, 아이콘, 선을 벡터로 만든다.",
    kindLabel: "봇",
    tone: "yellow",
    parent: "art",
    access: ["drive"],
    external: [],
    folders: ["00"],
    memory: true,
    rules: [
      "SVG로 만들고 Drive에 둔다.",
      "외부 게시 전에는 승인."
    ]
  }
];

const ROOMS = [
  {
    id: "room-notice",
    name: "하늘그네 공지방",
    summary: "전체 공지. 비서실장이 올리고 실무 봇이 받는다.",
    tone: "blue",
    fill: true,
    color: "#0a3d91",
    members: ["chief", "multi", "grok", "promo", "writer", "invest", "news", "dev", "video", "comment", "art", "bitmap", "vector"]
  },
  {
    id: "room-docs",
    name: "14 문서 검토·작성",
    summary: "글 초안, 사실 검토, 문안 다듬기.",
    tone: "red",
    fill: true,
    color: "#c8102e",
    members: ["writer", "invest", "promo", "comment"]
  },
  {
    id: "room-app",
    name: "13 앱인토스",
    summary: "앱과 웹. 개발, 밀린 일, 진행 정리.",
    tone: "ink",
    fill: true,
    color: "#141414",
    members: ["dev", "multi", "grok", "chief"]
  },
  {
    id: "room-novel",
    name: "09/05 소설방",
    summary: "소설과 콘티. 글, 논평, 사실 확인.",
    tone: "yellow",
    fill: true,
    color: "#a56b00",
    members: ["writer", "comment", "invest"]
  },
  {
    id: "room-contest",
    name: "공모 방들",
    summary: "공고, 원고, 문안, 검수, 그림.",
    tone: "red",
    split: true,
    color: "#c8102e",
    dash: "6 4",
    members: ["news", "writer", "promo", "invest", "art", "chief"]
  }
];

const SCENARIOS = [
  {
    id: "contest",
    name: "공모전 작업",
    steps: [
      { who: "주보 님", verb: "지시", text: "이 공모에 낸다. 마감과 내고 싶은 결을 말한다." },
      { who: "비서실장", verb: "배정", text: "완료기준, 가정, 마감을 적고 뉴스봇에 공고 조사를 맡긴다." },
      { who: "뉴스봇", verb: "공고 조사", text: "원문 링크, 자격, 마감, 제출처만 가져온다. 해석은 붙이지 않는다." },
      { who: "작가봇", verb: "초안", text: "글과 콘티를 Drive 00.하늘그네에 둔다. 미발표 원고는 무료 AI에 넣지 않는다." },
      { who: "수사봇", verb: "검토", text: "사실, 일부사실, 미확인, 오도 중 하나로 판정하고 링크를 붙인다." },
      { who: "홍보봇", verb: "다듬기", text: "응모 문안과 카피. 통과면 통과 한 단어만 돌려준다." },
      { who: "비서실장", verb: "확인", text: "루프는 최대 2회. 넘으면 더 고치지 않고 보고한 뒤 멈춘다." },
      { who: "주보 님", verb: "승인·제출", text: "제출은 승인 대상이다. 승인 다음에만 낸다." }
    ]
  },
  {
    id: "fact",
    name: "사실 검증",
    steps: [
      { who: "의뢰 봇", verb: "전달", text: "어느 봇이든 수사봇에게 주장 1줄과 출처 후보만 보낸다." },
      { who: "수사봇", verb: "대조", text: "웹과 X에서 원문을 본다. 판정을 다른 AI에 맡기지 않는다." },
      {
        who: "판정",
        verb: "네 갈래",
        text: "수사봇은 아래 넷 중 하나만 고른다. 이유 한 줄과 링크. 3줄 이하.",
        verdicts: [
          { name: "사실", text: "독립된 출처가 같은 말을 한다." },
          { name: "일부사실", text: "핵심은 맞지만 범위, 숫자, 인과가 다르다." },
          { name: "미확인", text: "공개 출처로 확인도 반박도 못 한다." },
          { name: "오도", text: "사실 조각을 이어 다른 결론처럼 보이게 한다." }
        ]
      }
    ]
  },
  {
    id: "image",
    name: "그림",
    steps: [
      { who: "주보 님", verb: "요청", text: "어디에 쓸 그림인지, 글이 먼저인지를 말한다." },
      { who: "아트봇 팀장", verb: "나눔", text: "장면과 질감은 비트맵, 로고·아이콘·선은 벡터. 직접 그리지 않는다." },
      {
        text: "아트봇이 한쪽을 고른다. 공개 업로드는 승인 대상이다.",
        fork: [
          { who: "비트맵봇", verb: "래스터", text: "그록 이매진. 그림 지시만 넣고 원고 전문은 넣지 않는다." },
          { who: "벡터봇", verb: "SVG", text: "선과 면으로 만들고 Drive에 둔다." }
        ]
      }
    ]
  }
];

const PIPE = [
  {
    title: "일 받음",
    lead: "지시, 방 메시지, 밀린 일을 그대로 적는다.",
    points: [
      "범위를 추측으로 키우지 않는다.",
      "비밀값과 원고 전문은 적지 않는다. 위치와 링크만."
    ]
  },
  {
    title: "단계 분류",
    lead: "일이 어떤 종류인지 먼저 가른다.",
    diagram: "classify"
  },
  {
    title: "완료기준·가정 먼저",
    lead: "끝나면 무엇이 달라져야 하는지 한 줄. 가정은 가정이라고 적는다.",
    points: ["모르면 비워 두고 묻는다.", "기준 없이 초안부터 쓰지 않는다."]
  },
  {
    title: "배정",
    lead: "담당이 분명하면 바로 보내고, 애매하면 주보 님께 올린다.",
    points: [
      "확실하면 그 봇에게 바로.",
      "애매하면 선택지를 짧게 적어 주보 님께.",
      "봇끼리 보낼 때는 결론 1줄과 링크, 3줄 이하."
    ]
  },
  {
    title: "실행",
    lead: "자기 커넥터 안에서만 한다.",
    points: [
      "미발표 원고는 무료 AI에 넣지 않는다.",
      "비밀번호와 키는 채팅에 쓰지 않는다."
    ]
  },
  {
    title: "검토 루프",
    lead: "글은 작가, 수사, 홍보 순서로 본다.",
    diagram: "loop"
  },
  {
    title: "실패 시 재시도",
    lead: "한 번만 다시 하고, 또 실패하면 보고하고 멈춘다.",
    diagram: "retry"
  },
  {
    title: "직접 확인 후 보고",
    lead: "결과물을 열어 본 뒤에 말한다. 개조식 반말. 결론 먼저.",
    diagram: "report"
  },
  {
    title: "종료 시 저장",
    lead: "간단 보고서와 대화 텍스트를 Drive 폴더에 넣는다.",
    diagram: "save"
  }
];

const catalog = new Map();
let allRes = [];

let pinned = "owner";
let hovered = null;
let scenarioIndex = 0;
let flowIndex = 0;
let playing = false;
let flowTimer = 0;
let pipeIndex = 0;
let layoutFrame = 0;
let lastColumn = null;

function closest(event, selector) {
  const target = event.target;
  const node = target && target.nodeType === 1 ? target : target && target.parentElement;
  if (!node || !node.closest) return null;
  return node.closest(selector);
}

function el(tag, attrs) {
  const node = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach((key) => {
      const value = attrs[key];
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else node.setAttribute(key, value === true ? "" : String(value));
    });
  }
  return node;
}

function text(tag, attrs, value) {
  const node = el(tag, attrs);
  node.textContent = value == null ? "" : String(value);
  return node;
}

function list(items) {
  const ul = el("ul");
  items.forEach((item) => {
    const li = el("li");
    li.textContent = item;
    ul.append(li);
  });
  return ul;
}

function botById(id) {
  return BOTS.find((bot) => bot.id === id) || null;
}

function folderName(code) {
  const folder = FOLDERS.find((item) => item.code === code);
  return folder ? folder.name : code;
}

function toolLines(bot) {
  const lines = [];
  if (bot.memory) lines.push("공유 메모리");
  if (bot.access.includes("drive")) {
    const names = bot.folders.map(folderName);
    lines.push(names.length ? "Drive (" + names.join(", ") + ")" : "Drive");
  }
  bot.access.filter((id) => id !== "drive").forEach((id) => {
    const meta = ACCESS.find((item) => item.id === id);
    lines.push(meta ? meta.name : id);
  });
  bot.external.forEach((id) => {
    const meta = EXTERNAL.find((item) => item.id === id);
    if (meta) lines.push(meta.name + " (" + meta.mark + ")");
  });
  if (!lines.length) lines.push("상시 커넥터 없음. 승인만 한다.");
  return lines;
}

function buildResources() {
  const memory = {
    id: "mem",
    kindLabel: "기억",
    name: "공유 메모리",
    role: "봇 사이 짧은 전달",
    summary: "결론 1줄과 링크. 원고 전문과 비밀은 올리지 않는다.",
    tone: "blue",
    mark: "기억",
    rules: ["3줄 이하.", "비밀번호, 키 금지."],
    links: BOTS.filter((bot) => bot.memory).map((bot) => bot.id)
  };
  const driveLinks = BOTS.filter((bot) => bot.access.includes("drive")).map((bot) => bot.id);
  const drive = {
    id: "drive",
    kindLabel: "저장",
    name: "Google Drive",
    role: "산출물과 기록",
    summary: "폴더 셋으로 나눈다. 채팅에 원고 전문을 붙이지 않는다.",
    tone: "blue",
    mark: "저장",
    rules: FOLDERS.map((folder) => folder.name + " — " + folder.summary),
    links: driveLinks
  };
  const folders = FOLDERS.map((folder) => ({
    id: folder.id,
    kindLabel: "폴더",
    name: folder.name,
    role: "Google Drive",
    summary: folder.summary,
    tone: "blue",
    mark: "폴더",
    rules: [],
    links: BOTS.filter((bot) => bot.folders.includes(folder.code)).map((bot) => bot.id),
    folder: true
  }));
  const conns = ACCESS.map((item) => ({
    id: "conn-" + item.id,
    kindLabel: item.group === "tool" ? "도구" : "커넥터",
    name: item.name,
    role: item.group === "tool" ? "도구" : "커넥터",
    summary: item.blurb,
    tone: "ink",
    mark: item.group === "tool" ? "도구" : "연결",
    rules: [],
    links: BOTS.filter((bot) => bot.access.includes(item.id)).map((bot) => bot.id),
    group: item.group,
    accessId: item.id
  }));
  const ais = EXTERNAL.map((item) => ({
    id: "ai-" + item.id,
    kindLabel: "바깥 AI",
    name: item.name,
    role: item.mark,
    summary: item.blurb,
    tone: item.tone,
    mark: item.mark,
    rules: item.id === "openrouter" ? ["미발표 원고 금지."] : item.id === "claude" ? ["선불. 원고 가능."] : ["개발봇만."],
    links: BOTS.filter((bot) => bot.external.includes(item.id)).map((bot) => bot.id),
    externalId: item.id
  }));
  allRes = [memory, drive].concat(folders, conns, ais);
}

function chipIdsFor(id) {
  const ids = [];
  const bot = botById(id);
  if (bot) {
    if (bot.parent) ids.push(bot.parent);
    BOTS.filter((item) => item.parent === id).forEach((item) => ids.push(item.id));
    ROOMS.forEach((room) => {
      if (room.members.includes(id)) ids.push(room.id);
    });
    allRes.forEach((res) => {
      if (res.links.includes(id)) ids.push(res.id);
    });
    return ids;
  }
  const room = ROOMS.find((item) => item.id === id);
  if (room) return room.members.slice();
  const res = allRes.find((item) => item.id === id);
  if (res) return res.links.slice();
  return ids;
}

function buildCatalog() {
  catalog.clear();
  buildResources();
  BOTS.forEach((bot) => {
    catalog.set(bot.id, {
      id: bot.id,
      kindLabel: bot.kindLabel,
      name: bot.name,
      role: bot.role,
      summary: bot.summary,
      rules: bot.rules,
      tools: toolLines(bot),
      chipIds: chipIdsFor(bot.id)
    });
  });
  ROOMS.forEach((room) => {
    catalog.set(room.id, {
      id: room.id,
      kindLabel: "방",
      name: room.name,
      role: "같이 있는 자리",
      summary: room.summary,
      rules: ["봇끼리 글은 결론 1줄과 링크, 3줄 이하."],
      tools: [],
      chipIds: chipIdsFor(room.id)
    });
  });
  allRes.forEach((res) => {
    catalog.set(res.id, {
      id: res.id,
      kindLabel: res.kindLabel,
      name: res.name,
      role: res.role,
      summary: res.summary,
      rules: res.rules,
      tools: [],
      chipIds: chipIdsFor(res.id)
    });
  });
}

function nodeButton(item, className) {
  const button = el("button", {
    type: "button",
    class: className,
    "data-id": item.id,
    "aria-label": item.name + ". " + (item.role || "")
  });
  button.append(text("span", { class: "node-mark" }, item.mark || ""));
  button.append(text("span", { class: "node-name" }, item.name));
  const rooms = ROOMS.filter((room) => room.members.includes(item.id));
  if (rooms.length && className.indexOf("node-room") === -1 && className.indexOf("node-res") === -1) {
    const dots = el("span", { class: "dots", "aria-hidden": "true" });
    rooms.forEach((room) => {
      const dot = el("i", { class: "dot" });
      dot.style.background = room.color;
      dots.append(dot);
    });
    button.append(dots);
  }
  return button;
}

function botClass(bot) {
  const parts = ["node", "tone-" + bot.tone];
  if (bot.id === "owner" || bot.id === "chief") parts.push("node-lead");
  else parts.push("node-staff");
  if (bot.fill) parts.push("fill");
  if (bot.shape) parts.push("shape-" + bot.shape);
  return parts.join(" ");
}

function renderOrg() {
  const rowOwner = document.getElementById("rowOwner");
  const rowChief = document.getElementById("rowChief");
  const staffRow = document.getElementById("staffRow");
  const roomRow = document.getElementById("roomRow");
  rowOwner.replaceChildren(nodeButton(botById("owner"), botClass(botById("owner"))));
  rowChief.replaceChildren(nodeButton(botById("chief"), botClass(botById("chief"))));
  staffRow.replaceChildren();
  BOTS.filter((bot) => bot.parent === "chief").forEach((bot) => {
    if (bot.id !== "art") {
      staffRow.append(nodeButton(bot, botClass(bot)));
      return;
    }
    const stack = el("div", { class: "art-stack" });
    stack.append(nodeButton(bot, botClass(bot)));
    const kids = el("div", { class: "art-kids" });
    BOTS.filter((child) => child.parent === "art").forEach((child) => {
      kids.append(nodeButton(child, botClass(child)));
    });
    stack.append(kids);
    staffRow.append(stack);
  });
  roomRow.replaceChildren();
  ROOMS.forEach((room) => {
    const cls = ["node", "node-room", "tone-" + room.tone];
    if (room.fill) cls.push("fill");
    if (room.split) cls.push("split");
    const button = nodeButton({ id: room.id, name: room.name, mark: "방", role: room.summary }, cls.join(" "));
    roomRow.append(button);
  });
  renderResources();
}

function renderResources() {
  const wrap = document.getElementById("resWrap");
  wrap.replaceChildren();
  const memory = allRes.find((item) => item.id === "mem");
  const drive = allRes.find((item) => item.id === "drive");
  wrap.append(resourceBlock("기억 · 저장", [nodeButton(memory, "node node-res tone-blue"), driveCard(drive)]));
  wrap.append(resourceBlock("커넥터", allRes.filter((item) => item.group === "conn").map((item) => nodeButton(item, "node node-conn tone-ink"))));
  wrap.append(resourceBlock("도구", allRes.filter((item) => item.group === "tool").map((item) => nodeButton(item, "node node-conn tone-gold"))));
  wrap.append(resourceBlock("바깥 AI", allRes.filter((item) => item.externalId).map((item) => nodeButton(item, "node node-ai tone-" + item.tone))));
}

function driveCard(drive) {
  const card = el("div", { class: "res-card" });
  card.append(nodeButton(drive, "node node-res tone-blue"));
  const row = el("div", { class: "folder-row" });
  allRes.filter((item) => item.folder).forEach((folder) => {
    row.append(nodeButton(folder, "node node-folder tone-blue"));
  });
  card.append(row);
  return card;
}

function resourceBlock(label, nodes) {
  const block = el("div", { class: "res-block" });
  block.append(text("p", { class: "layer-label" }, label));
  const row = el("div", { class: "res-row" });
  nodes.forEach((node) => row.append(node));
  block.append(row);
  return block;
}

function showDetail(id) {
  const item = catalog.get(id);
  const detail = document.getElementById("detail");
  if (!item || !detail) return;
  detail.replaceChildren();
  detail.append(text("p", { class: "kicker" }, item.kindLabel));
  detail.append(text("h3", {}, item.name));
  if (item.role) detail.append(text("p", { class: "role" }, item.role));
  if (item.summary) detail.append(text("p", {}, item.summary));
  if (item.tools && item.tools.length) {
    detail.append(text("h4", {}, "도구·커넥터"));
    detail.append(list(item.tools));
  }
  if (item.rules && item.rules.length) {
    detail.append(text("h4", {}, "규칙"));
    detail.append(list(item.rules));
  }
  if (item.chipIds && item.chipIds.length) {
    detail.append(text("h4", {}, "연결"));
    const row = el("div", { class: "chips" });
    item.chipIds.forEach((cid) => {
      const chipItem = catalog.get(cid);
      if (!chipItem) return;
      const button = el("button", { type: "button", class: "chip", "data-jump": cid });
      button.textContent = chipItem.name;
      row.append(button);
    });
    detail.append(row);
  }
}

function pin(id, scroll) {
  if (!catalog.has(id)) return;
  pinned = id;
  showDetail(id);
  applyHighlight();
  if (!scroll) return;
  const node = document.querySelector("#board [data-id='" + id + "']");
  if (node) node.scrollIntoView({ block: "nearest", inline: "center" });
}

function columnLayout() {
  const row = document.getElementById("staffRow");
  if (!row) return true;
  return getComputedStyle(row).flexDirection === "column";
}

function geom(node) {
  const board = document.getElementById("board");
  let x = 0;
  let y = 0;
  let current = node;
  let guard = 0;
  while (current && current !== board && guard < 12) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent;
    guard += 1;
  }
  const w = node.offsetWidth;
  const h = node.offsetHeight;
  return { left: x, top: y, w: w, h: h, cx: x + w / 2, bottom: y + h };
}

function addPath(d, className, a, b) {
  const svg = document.getElementById("links");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.setAttribute("class", className);
  if (a) path.dataset.a = a;
  if (b) path.dataset.b = b;
  svg.appendChild(path);
  return path;
}

function busLink(parentNode, childNode) {
  const parent = geom(parentNode);
  const child = geom(childNode);
  const mid = parent.bottom + Math.max(8, (child.top - parent.bottom) * 0.5);
  return "M " + parent.cx + " " + parent.bottom + " L " + parent.cx + " " + mid + " L " + child.cx + " " + mid + " L " + child.cx + " " + child.top;
}

function spineLink(parentNode, childNode) {
  const parent = geom(parentNode);
  const child = geom(childNode);
  const x = 12;
  const y1 = parent.top + parent.h / 2;
  const y2 = child.top + child.h / 2;
  return "M " + x + " " + y1 + " L " + x + " " + y2 + " L " + child.left + " " + y2;
}

function memberAnchor(node) {
  const box = geom(node);
  if (node.dataset.id === "art") {
    const kids = node.parentElement.querySelectorAll(".art-kids [data-id]");
    if (kids.length >= 2) {
      const first = geom(kids[0]);
      const second = geom(kids[1]);
      const left = first.left < second.left ? first : second;
      const right = first.left < second.left ? second : first;
      return {
        x: (left.left + left.w + right.left) / 2,
        y: box.bottom,
        left: box.left,
        midY: box.top + box.h / 2
      };
    }
  }
  return { x: box.cx, y: box.bottom, left: box.left, midY: box.top + box.h / 2 };
}

function drawCommand() {
  const column = columnLayout();
  BOTS.forEach((bot) => {
    if (!bot.parent) return;
    const parentNode = document.querySelector("#board [data-id='" + bot.parent + "']");
    const childNode = document.querySelector("#board [data-id='" + bot.id + "']");
    if (!parentNode || !childNode) return;
    addPath(column ? spineLink(parentNode, childNode) : busLink(parentNode, childNode), "link link-cmd", bot.parent, bot.id);
  });
}

function drawRooms() {
  if (columnLayout()) return;
  const gap = document.getElementById("laneGap");
  const box = geom(gap);
  if (box.h < 24) return;
  ROOMS.forEach((room, index) => {
    const roomNode = document.querySelector("#board [data-id='" + room.id + "']");
    if (!roomNode) return;
    const laneY = box.top + 14 + ((box.h - 28) * index) / Math.max(1, ROOMS.length - 1);
    const roomBox = geom(roomNode);
    const staffTop = geom(document.getElementById("staffRow")).top;
    room.members.forEach((memberId) => {
      const memberNode = document.querySelector("#board [data-id='" + memberId + "']");
      if (!memberNode) return;
      const start = memberAnchor(memberNode);
      const d = start.y < staffTop - 8
        ? "M " + start.left + " " + start.midY + " L 8 " + start.midY + " L 8 " + laneY + " L " + roomBox.cx + " " + laneY + " L " + roomBox.cx + " " + roomBox.top
        : "M " + start.x + " " + start.y + " L " + start.x + " " + laneY + " L " + roomBox.cx + " " + laneY + " L " + roomBox.cx + " " + roomBox.top;
      const path = addPath(d, "link link-room", room.id, memberId);
      path.style.setProperty("--link", room.color);
      if (room.dash) path.setAttribute("stroke-dasharray", room.dash);
    });
  });
}

function gutterLink(botNode, resNode) {
  const bot = geom(botNode);
  const res = geom(resNode);
  const x = 8;
  const y1 = bot.top + bot.h / 2;
  const y2 = res.top + res.h / 2;
  return "M " + bot.left + " " + y1 + " L " + x + " " + y1 + " L " + x + " " + y2 + " L " + res.left + " " + y2;
}

function relatedSet(id) {
  const set = new Set([id]);
  const bot = botById(id);
  if (bot) {
    if (bot.parent) set.add(bot.parent);
    BOTS.filter((item) => item.parent === id).forEach((item) => set.add(item.id));
    ROOMS.forEach((room) => {
      if (room.members.includes(id)) set.add(room.id);
    });
    allRes.forEach((res) => {
      if (res.links.includes(id)) set.add(res.id);
    });
  }
  const room = ROOMS.find((item) => item.id === id);
  if (room) room.members.forEach((memberId) => set.add(memberId));
  const res = allRes.find((item) => item.id === id);
  if (res) res.links.forEach((memberId) => set.add(memberId));
  return set;
}

function highlightId() {
  if (document.documentElement.classList.contains("has-hover")) return hovered;
  return pinned;
}

function drawResourceLinks(id) {
  document.querySelectorAll("#links .link-res").forEach((node) => node.remove());
  if (!id || columnLayout()) return;
  const pairs = [];
  const res = allRes.find((item) => item.id === id);
  if (res) res.links.forEach((memberId) => pairs.push([memberId, res.id]));
  else {
    allRes.forEach((item) => {
      if (item.links.includes(id)) pairs.push([id, item.id]);
    });
  }
  pairs.forEach((pair) => {
    const botNode = document.querySelector("#board [data-id='" + pair[0] + "']");
    const resNode = document.querySelector("#board [data-id='" + pair[1] + "']");
    if (!botNode || !resNode) return;
    addPath(gutterLink(botNode, resNode), "link link-res is-hot", pair[0], pair[1]);
  });
}

function applyHighlight() {
  const id = highlightId();
  const related = id ? relatedSet(id) : null;
  document.querySelectorAll("#board [data-id]").forEach((node) => {
    const hot = !!(related && related.has(node.dataset.id));
    node.classList.toggle("is-hot", hot);
    node.classList.toggle("is-dim", !!(related && !hot));
    node.classList.toggle("is-pinned", node.dataset.id === pinned);
    if (node.dataset.id === pinned) node.setAttribute("aria-current", "true");
    else node.removeAttribute("aria-current");
  });
  document.querySelectorAll("#links .link-cmd, #links .link-room").forEach((path) => {
    const hot = !!(id && (path.dataset.a === id || path.dataset.b === id));
    path.classList.toggle("is-hot", hot);
    path.classList.toggle("is-dim", !!(id && !hot));
  });
  drawResourceLinks(id);
}

function draw() {
  const svg = document.getElementById("links");
  const board = document.getElementById("board");
  if (!svg || !board || board.clientWidth < 20 || board.clientHeight < 20) return;
  svg.setAttribute("width", String(board.clientWidth));
  svg.setAttribute("height", String(board.clientHeight));
  svg.style.width = board.clientWidth + "px";
  svg.style.height = board.clientHeight + "px";
  svg.replaceChildren();
  drawCommand();
  drawRooms();
  applyHighlight();
}

function syncChrome() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
}

function syncScrollHint() {
  const scroller = document.getElementById("boardScroll");
  const hint = document.getElementById("scrollHint");
  if (!scroller || !hint) return;
  const show = scroller.scrollWidth > scroller.clientWidth + 8;
  if (hint.hidden === !show) return;
  hint.hidden = !show;
}

function centerBoard() {
  const scroller = document.getElementById("boardScroll");
  const owner = document.querySelector("#board [data-id='owner']");
  if (!scroller || !owner) return;
  if (scroller.scrollWidth <= scroller.clientWidth + 8) return;
  const left = owner.offsetLeft + owner.offsetWidth / 2 - scroller.clientWidth / 2;
  scroller.scrollLeft = Math.max(0, left);
}

function maybeCenter() {
  const column = columnLayout();
  if (lastColumn === column) return;
  lastColumn = column;
  if (!column) centerBoard();
}

function layout() {
  syncChrome();
  draw();
  settlePacket();
  syncScrollHint();
  maybeCenter();
}

function queueLayout() {
  if (layoutFrame) return;
  layoutFrame = window.requestAnimationFrame(() => {
    layoutFrame = 0;
    layout();
  });
}

function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function syncPointer() {
  document.documentElement.classList.toggle("has-hover", finePointer());
}

function renderScenarios() {
  const bar = document.getElementById("scenarioBar");
  bar.replaceChildren();
  SCENARIOS.forEach((scenario, index) => {
    const button = el("button", { type: "button", class: "scenario", "data-scenario": String(index) });
    button.setAttribute("aria-pressed", index === scenarioIndex ? "true" : "false");
    button.textContent = scenario.name;
    bar.append(button);
  });
}

function stepTitle(step) {
  if (step.fork) return "비트맵봇 / 벡터봇";
  return step.who + " · " + step.verb;
}

function buildTrack() {
  const track = document.getElementById("track");
  const scenario = SCENARIOS[scenarioIndex];
  track.replaceChildren();
  scenario.steps.forEach((step, index) => {
    const grow = step.fork || step.verdicts ? " grow" : "";
    const root = el("div", { class: "step" + grow, "data-step": String(index) });
    if (step.fork) {
      const fork = el("div", { class: "fork" });
      step.fork.forEach((item) => {
        const button = el("button", {
          type: "button",
          class: "fork-card",
          "data-token": "1",
          "data-step": String(index)
        });
        button.append(text("span", { class: "step-no" }, String(index + 1)));
        button.append(text("span", { class: "step-who" }, item.who));
        button.append(text("span", { class: "step-verb" }, item.verb));
        fork.append(button);
      });
      root.append(fork);
    } else {
      const button = el("button", {
        type: "button",
        class: "step-jump",
        "data-token": "1",
        "data-step": String(index)
      });
      button.append(text("span", { class: "step-no" }, String(index + 1)));
      button.append(text("span", { class: "step-who" }, step.who));
      button.append(text("span", { class: "step-verb" }, step.verb));
      if (step.verdicts) {
        button.append(text("span", { class: "mini-names" }, step.verdicts.map((item) => item.name).join(" · ")));
      }
      root.append(button);
    }
    track.append(root);
  });
}

function markFlow() {
  document.querySelectorAll("#track .step").forEach((step) => {
    const on = Number(step.dataset.step) === flowIndex;
    step.classList.toggle("is-on", on);
    step.querySelectorAll("[data-token]").forEach((token) => token.classList.toggle("is-on", on));
  });
}

function renderReadout() {
  const scenario = SCENARIOS[scenarioIndex];
  const step = scenario.steps[flowIndex];
  const box = document.getElementById("flowReadout");
  box.replaceChildren();
  box.append(text("p", { class: "kicker" }, scenario.name));
  box.append(text("h3", {}, stepTitle(step)));
  box.append(text("p", {}, step.text));
  const cards = step.verdicts || step.fork || null;
  if (cards) {
    const grid = el("div", { class: "verdicts" });
    cards.forEach((item) => {
      const cell = el("div", { class: "verdict" });
      cell.append(text("b", {}, item.name || item.who));
      cell.append(text("span", {}, item.text));
      grid.append(cell);
    });
    box.append(grid);
  }
  document.getElementById("flowCount").textContent = (flowIndex + 1) + " / " + scenario.steps.length;
}

function ensurePackets() {
  const stage = document.getElementById("flowStage");
  if (document.getElementById("pkt0")) return;
  const first = el("span", { class: "packet", id: "pkt0" });
  first.hidden = true;
  stage.append(first);
  const second = el("span", { class: "packet alt", id: "pkt1" });
  second.hidden = true;
  stage.append(second);
}

function tokensFor(index) {
  const step = document.querySelector("#track .step[data-step='" + index + "']");
  if (!step) return [];
  return Array.from(step.querySelectorAll("[data-token]"));
}

function tokenPoint(node) {
  const stage = document.getElementById("flowStage");
  const track = document.getElementById("track");
  const stageBox = stage.getBoundingClientRect();
  const box = node.getBoundingClientRect();
  const column = getComputedStyle(track).flexDirection === "column";
  if (column) return { x: box.left - stageBox.left - 14, y: box.top - stageBox.top + box.height / 2 };
  return { x: box.left - stageBox.left + box.width / 2, y: box.top - stageBox.top };
}

function movePackets(from, to, animate) {
  const packets = [document.getElementById("pkt0"), document.getElementById("pkt1")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  packets.forEach((packet, index) => {
    if (!packet) return;
    if (!to[index]) {
      packet.hidden = true;
      return;
    }
    packet.hidden = false;
    const end = to[index];
    const start = from[Math.min(index, Math.max(0, from.length - 1))] || end;
    if (!animate || reduce) {
      packet.style.transition = "none";
      packet.style.left = end.x + "px";
      packet.style.top = end.y + "px";
      packet.getBoundingClientRect();
      packet.style.transition = "";
      return;
    }
    packet.style.transition = "none";
    packet.style.left = start.x + "px";
    packet.style.top = start.y + "px";
    packet.getBoundingClientRect();
    packet.style.transition = "";
    packet.style.left = end.x + "px";
    packet.style.top = end.y + "px";
  });
}

function settlePacket() {
  const points = tokensFor(flowIndex).map(tokenPoint);
  if (!points.length) return;
  movePackets(points, points, false);
}

function updatePlay() {
  const button = document.getElementById("flowPlay");
  const last = SCENARIOS[scenarioIndex].steps.length - 1;
  button.textContent = playing ? "일시정지" : "재생";
  button.setAttribute("aria-pressed", playing ? "true" : "false");
  document.getElementById("flowPrev").disabled = flowIndex === 0;
  document.getElementById("flowNext").disabled = flowIndex === last;
}

function goFlow(next, animate) {
  const from = tokensFor(flowIndex).map(tokenPoint);
  flowIndex = next;
  markFlow();
  renderReadout();
  movePackets(from, tokensFor(flowIndex).map(tokenPoint), animate);
  updatePlay();
}

function clearFlowTimer() {
  if (flowTimer) window.clearTimeout(flowTimer);
  flowTimer = 0;
}

function scheduleFlow() {
  clearFlowTimer();
  if (!playing) return;
  flowTimer = window.setTimeout(() => {
    const last = SCENARIOS[scenarioIndex].steps.length - 1;
    if (flowIndex >= last) {
      playing = false;
      updatePlay();
      return;
    }
    goFlow(flowIndex + 1, true);
    scheduleFlow();
  }, 1700);
}

function onFlowPlay() {
  const last = SCENARIOS[scenarioIndex].steps.length - 1;
  if (playing) {
    playing = false;
    clearFlowTimer();
    updatePlay();
    return;
  }
  if (flowIndex >= last) goFlow(0, false);
  playing = true;
  updatePlay();
  scheduleFlow();
}

function diagram(name) {
  if (name === "classify") return classifyDiagram();
  if (name === "loop") return loopDiagram();
  if (name === "retry") return retryDiagram();
  if (name === "report") return reportSample();
  if (name === "save") return saveDiagram();
  return el("div");
}

function classifyDiagram() {
  const wrap = el("div", { class: "pairs" });
  [
    ["생성", "전문봇"],
    ["정확한 규칙", "코드·체크리스트"],
    ["고르기", "구조화 질문"],
    ["되돌리기 어려움", "주보 님 승인"]
  ].forEach((pair) => {
    const row = el("div", { class: "pair" });
    row.append(text("div", { class: "pair-k" }, pair[0]));
    row.append(text("div", { class: "pair-v" }, pair[1]));
    wrap.append(row);
  });
  return wrap;
}

function loopDiagram() {
  const wrap = el("div");
  const row = el("div", { class: "loop" });
  ["작가봇", "수사봇", "홍보봇"].forEach((name, index) => {
    if (index) row.append(text("span", { class: "arrow", "aria-hidden": "true" }, "→"));
    row.append(text("span", { class: "loop-node" }, name));
  });
  wrap.append(row);
  const note = el("p");
  note.append(text("span", { class: "pass" }, "통과"));
  note.append(document.createTextNode(" 한 단어만 통과. 최대 2회. 넘으면 보고하고 멈춤."));
  wrap.append(note);
  return wrap;
}

function retryDiagram() {
  const row = el("div", { class: "loop" });
  ["실패", "재시도 1회", "보고 후 정지"].forEach((name, index) => {
    if (index) row.append(text("span", { class: "arrow", "aria-hidden": "true" }, "→"));
    row.append(text("span", { class: "loop-node" }, name));
  });
  return row;
}

function reportSample() {
  const box = el("div", { class: "sample" });
  box.append(text("p", { class: "sample-k" }, "보고 예"));
  ["결론. 초안은 드라이브에 있음. 제출은 안 함.", "- 수사: 일부사실. 링크만 붙임.", "- 홍보: 통과.", "- 남은 것: 주보 님 승인."].forEach((line) => {
    box.append(text("p", {}, line));
  });
  return box;
}

function saveDiagram() {
  const ul = el("ul", { class: "folder-list" });
  [
    ["00.하늘그네", "산출물, 간단 보고서, 대화 텍스트"],
    ["01.결정_진행표", "결정과 지금 단계"],
    ["02.실수_기록", "틀린 것, 원인, 다음"]
  ].forEach((pair) => {
    const li = el("li");
    li.append(text("b", {}, pair[0]));
    li.append(document.createTextNode(" " + pair[1]));
    ul.append(li);
  });
  return ul;
}

function renderPipe() {
  const listBox = document.getElementById("pipeList");
  const panel = document.getElementById("pipePanel");
  listBox.replaceChildren();
  PIPE.forEach((step, index) => {
    const button = el("button", {
      type: "button",
      class: "pipe-step" + (index === pipeIndex ? " is-on" : ""),
      "data-pipe": String(index)
    });
    if (index === pipeIndex) button.setAttribute("aria-current", "step");
    button.append(text("span", { class: "step-no" }, String(index + 1)));
    button.append(text("span", {}, step.title));
    listBox.append(button);
  });
  const step = PIPE[pipeIndex];
  panel.replaceChildren();
  panel.append(text("p", { class: "kicker" }, (pipeIndex + 1) + " / " + PIPE.length));
  panel.append(text("h3", {}, step.title));
  panel.append(text("p", {}, step.lead));
  if (step.points) panel.append(list(step.points));
  if (step.diagram) panel.append(diagram(step.diagram));
  document.getElementById("pipePrev").disabled = pipeIndex === 0;
  document.getElementById("pipeNext").disabled = pipeIndex === PIPE.length - 1;
}

function setPipe(index, moveFocus) {
  const next = Math.max(0, Math.min(PIPE.length - 1, index));
  const listBox = document.getElementById("pipeList");
  const hadFocus = listBox.contains(document.activeElement);
  pipeIndex = next;
  renderPipe();
  if (moveFocus || hadFocus) {
    const button = listBox.querySelector("[data-pipe='" + pipeIndex + "']");
    if (button) button.focus();
  }
}

function cellMark(on, draft) {
  const td = el("td");
  if (draft) {
    td.append(text("span", { class: "draft-mark" }, "초안"));
    td.append(text("span", { class: "sr" }, "초안만. 발송은 승인"));
    return td;
  }
  td.append(el("span", { class: on ? "dot-on" : "dot-off" }));
  td.append(text("span", { class: "sr" }, on ? "사용" : "없음"));
  return td;
}

function renderMatrices() {
  const cols = [{ id: "memory", name: "공유 메모리" }].concat(ACCESS.map((item) => ({ id: item.id, name: item.name })));
  const table = el("table", { class: "matrix" });
  const caption = el("caption", { class: "sr" });
  caption.textContent = "봇별 커넥터와 도구";
  table.append(caption);
  const thead = el("thead");
  const headRow = el("tr");
  headRow.append(text("th", { scope: "col" }, "봇"));
  cols.forEach((col) => headRow.append(text("th", { scope: "col" }, col.name)));
  thead.append(headRow);
  table.append(thead);
  const tbody = el("tbody");
  BOTS.forEach((bot) => {
    const row = el("tr");
    const th = el("th", { scope: "row" });
    const button = el("button", { type: "button", class: "row-btn", "data-bot": bot.id });
    button.textContent = bot.name;
    th.append(button);
    row.append(th);
    cols.forEach((col) => {
      let on = false;
      if (col.id === "memory") on = bot.memory;
      else on = bot.access.includes(col.id);
      const draft = bot.id === "chief" && col.id === "gmail";
      row.append(cellMark(on, draft));
    });
    tbody.append(row);
  });
  table.append(tbody);
  const mount = document.getElementById("matrixMount");
  const wrap = el("div", { class: "matrix-wrap" });
  wrap.append(table);
  mount.replaceChildren(wrap);

  const aiTable = el("table", { class: "matrix" });
  const aiCaption = el("caption", { class: "sr" });
  aiCaption.textContent = "봇별 바깥 AI";
  aiTable.append(aiCaption);
  const aiHead = el("thead");
  const aiHeadRow = el("tr");
  aiHeadRow.append(text("th", { scope: "col" }, "봇"));
  EXTERNAL.forEach((item) => aiHeadRow.append(text("th", { scope: "col" }, item.name)));
  aiHead.append(aiHeadRow);
  aiTable.append(aiHead);
  const aiBody = el("tbody");
  BOTS.forEach((bot) => {
    const row = el("tr");
    const th = el("th", { scope: "row" });
    const button = el("button", { type: "button", class: "row-btn", "data-bot": bot.id });
    button.textContent = bot.name;
    th.append(button);
    row.append(th);
    EXTERNAL.forEach((item) => row.append(cellMark(bot.external.includes(item.id), false)));
    aiBody.append(row);
  });
  aiTable.append(aiBody);
  const aiWrap = el("div", { class: "matrix-wrap" });
  aiWrap.append(aiTable);
  document.getElementById("aiMount").replaceChildren(aiWrap);
}

function bindNav() {
  const links = Array.from(document.querySelectorAll(".nav a"));
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if (typeof IntersectionObserver !== "function") return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const on = link.getAttribute("href") === "#" + entry.target.id;
        link.classList.toggle("is-on", on);
        if (on) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 });
  sections.forEach((section) => observer.observe(section));
}

function bind() {
  const board = document.getElementById("board");
  board.addEventListener("click", (event) => {
    const button = closest(event, "[data-id]");
    if (!button || !board.contains(button)) return;
    pin(button.dataset.id, false);
  });
  board.addEventListener("mouseover", (event) => {
    const button = closest(event, "[data-id]");
    const next = button && board.contains(button) ? button.dataset.id : null;
    if (next === hovered) return;
    hovered = next;
    applyHighlight();
  });
  board.addEventListener("mouseout", (event) => {
    const to = event.relatedTarget;
    if (to && board.contains(to)) return;
    if (!hovered) return;
    hovered = null;
    applyHighlight();
  });
  board.addEventListener("focusin", (event) => {
    const button = closest(event, "[data-id]");
    if (!button) return;
    hovered = button.dataset.id;
    applyHighlight();
  });
  board.addEventListener("focusout", (event) => {
    if (board.contains(event.relatedTarget)) return;
    hovered = null;
    applyHighlight();
  });
  document.getElementById("detail").addEventListener("click", (event) => {
    const button = closest(event, "[data-jump]");
    if (!button) return;
    pin(button.dataset.jump, true);
  });
  document.getElementById("scenarioBar").addEventListener("click", (event) => {
    const button = closest(event, "[data-scenario]");
    if (!button) return;
    scenarioIndex = Number(button.dataset.scenario);
    flowIndex = 0;
    renderScenarios();
    buildTrack();
    markFlow();
    renderReadout();
    updatePlay();
    queueLayout();
    if (playing) scheduleFlow();
  });
  document.getElementById("flowPrev").addEventListener("click", () => {
    if (flowIndex === 0) return;
    goFlow(flowIndex - 1, true);
    if (playing) scheduleFlow();
  });
  document.getElementById("flowNext").addEventListener("click", () => {
    const last = SCENARIOS[scenarioIndex].steps.length - 1;
    if (flowIndex >= last) return;
    goFlow(flowIndex + 1, true);
    if (playing) scheduleFlow();
  });
  document.getElementById("flowPlay").addEventListener("click", onFlowPlay);
  document.getElementById("track").addEventListener("click", (event) => {
    const step = closest(event, "[data-step]");
    if (!step || !document.getElementById("track").contains(step)) return;
    const index = Number(step.dataset.step);
    playing = false;
    clearFlowTimer();
    if (index !== flowIndex) goFlow(index, true);
    else updatePlay();
  });
  document.getElementById("flow").addEventListener("keydown", (event) => {
    const zone = closest(event, ".flow-controls, #track, #flowReadout");
    if (!zone) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    if (event.key === "ArrowRight") document.getElementById("flowNext").click();
    else document.getElementById("flowPrev").click();
  });
  document.getElementById("pipeList").addEventListener("click", (event) => {
    const button = closest(event, "[data-pipe]");
    if (!button) return;
    setPipe(Number(button.dataset.pipe), false);
  });
  document.getElementById("pipePrev").addEventListener("click", () => setPipe(pipeIndex - 1, false));
  document.getElementById("pipeNext").addEventListener("click", () => setPipe(pipeIndex + 1, false));
  document.getElementById("pipe").addEventListener("keydown", (event) => {
    if (!closest(event, "#pipeList, .pipe-nav, #pipePanel")) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowUp") return;
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    setPipe(pipeIndex + delta, true);
  });
  document.getElementById("rules").addEventListener("click", (event) => {
    const button = closest(event, "[data-bot]");
    if (!button) return;
    pin(button.dataset.bot, true);
    const org = document.getElementById("org");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    org.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
  bindNav();
  const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (pointer.addEventListener) pointer.addEventListener("change", () => {
    syncPointer();
    applyHighlight();
  });
  window.addEventListener("resize", queueLayout);
  window.addEventListener("pageshow", queueLayout);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden || !playing) return;
    playing = false;
    clearFlowTimer();
    updatePlay();
  });
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(queueLayout);
    observer.observe(document.getElementById("boardScroll"));
    observer.observe(document.getElementById("flowStage"));
    observer.observe(document.querySelector(".site-header"));
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueLayout);
}

function init() {
  buildCatalog();
  renderOrg();
  ensurePackets();
  renderScenarios();
  buildTrack();
  markFlow();
  renderReadout();
  updatePlay();
  renderPipe();
  renderMatrices();
  syncPointer();
  showDetail(pinned);
  bind();
  queueLayout();
  window.requestAnimationFrame(queueLayout);
}

init();
