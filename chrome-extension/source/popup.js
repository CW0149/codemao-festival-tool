/* eslint-disable no-undef */

let openToolBtn = document.getElementById('openToolBtn');

const TO_MATCH_URL = 'https://festival.codemao.cn/h5/yybAdmin/';
const TOKEN_KEY = 'yyb_vue_admin_template_token';
const ALERT_LOGIN = '请先登录年课系统，之后再重新点击“打开班期工具”按钮';

const PROD_TOOL_URL = 'http://42.194.164.225/codemao-resitival-tool/';
const TEST_TOOL_URL = 'http://localhost:3000';
const TOOL_URL = PROD_TOOL_URL;

const openToolHandler = async () => {
  const loggedInInfo = await getLoggedInInfo();
  const { loggedIn, token, teacherEmail } = loggedInInfo;

  if (loggedIn) {
    openCodemaoToolTab(token, teacherEmail);
  } else {
    alert(ALERT_LOGIN);

    /**
     * Remove not logged in codemao pages
     */
    const existedCodemaoTabs = await chrome.tabs.query({
      url: TO_MATCH_URL,
      currentWindow: true,
    });
    let selectedCodemaoTab = null;

    switch (existedCodemaoTabs.length) {
      case 0:
        selectedCodemaoTab = await chrome.tabs.create({
          active: false,
          url: TO_MATCH_URL,
        });
        break;
      case 1:
        selectedCodemaoTab = existedCodemaoTabs[0];
        break;
      default:
        selectedCodemaoTab = existedCodemaoTabs[existedCodemaoTabs.length - 1];
        await chrome.tabs.remove(
          existedCodemaoTabs.slice(0, -1).map((tab) => tab.id)
        );
    }

    chrome.tabs.update(selectedCodemaoTab.id, { active: true });
  }
};

openToolBtn.addEventListener('click', openToolHandler);

const openCodemaoToolTab = async (token, teacherEmail) => {
  const searchParams = new URLSearchParams({
    token,
    teacher_email: teacherEmail,
  });

  window.open(`${TOOL_URL}?${searchParams.toString()}`);
};

const getLoggedInInfo = async () => {
  const token = (
    await chrome.cookies.get({
      name: TOKEN_KEY,
      url: TO_MATCH_URL,
    })
  )?.value;
  if (!token) return { loggedIn: false };

  const teacherEmail = await getTeacherEmail(token);
  if (!teacherEmail) return { loggedIn: false };

  return { loggedIn: true, token, teacherEmail };
};

// Excute in tab
const getFestivalData = (token, url) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      token,
    },
  }).then((res) => {
    return res.json();
  });
};

const getTeacherEmail = (token) => {
  return getFestivalData(
    token,
    'https://festival.codemao.cn/yyb2019/index/info'
  ).then((res) => res?.info?.username ?? '');
};
