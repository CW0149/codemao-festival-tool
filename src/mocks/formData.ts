const urlSearchParams = new URLSearchParams(window.location.search);
const tokenInUrl = urlSearchParams.get('token');
const emailInUrl = urlSearchParams.get('teacher_email') || '';

export const formData = {
  token: tokenInUrl || process.env.REACT_APP_FESTIVAL_TOKEN,
  workName: '机器人超阶课',
  classInfo: '编程猫机器人高阶课3期MT7',
  ownerEmail: emailInUrl || 'yanluxia@codemao.cn',
  shippingGoodsDesc: 'SU003670 编程猫机器人创造家V1.0礼盒 1',
  packageName: '编程猫机器人高阶课',
  ids: '',
};
