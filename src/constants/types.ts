import { formData } from '../mocks/formData';

type OrderKeys =
  | 'id'
  | 'username'
  | 'paytime'
  | 'out_trade_no'
  | 'tel'
  | 'paytype'
  | 'paymoney'
  | 'paytit'
  | 'tit'
  | 'class_name'
  | 'term_name'
  | 'class_time'
  | 'teacher_name'
  | 'teacher_qrc'
  | 'tips'
  | 'adds'
  | 'user_id'
  | 'flagid'
  | 'classinfo'
  | 'businessType'
  | 'flag'
  | 'backflag'
  | 'backmoney'
  | 'backtype'
  | 'backreason'
  | 'backaccount'
  | 'backtime'
  | 'backperson'
  | 'backspeed'
  | 'edittime'
  | 'backaccountmsg'
  | 'backaliname'
  | 'backname'
  | 'backclassnum'
  | 'backticket'
  | 'backtips'
  | 'headimgurl'
  | 'package_name_1000'
  | 'term_name_1000'
  | 'class_name_1000'
  | 'term_name_16'
  | 'class_name_16'
  | 'package_name_16'
  | 'times'
  | 'teacher_email_1000'
  | 'teacher_email_16'
  | 'inttercher_16'
  | 'inttercher_1000'
  | 'bookinfo'
  | 'lingflag'
  | 'upid'
  | 'nickname'
  | 'piclist'
  | 'totimes'
  | 'toflag'
  | 'orderflag'
  | 'taketimes'
  | 'backyeji'
  | 'classnum'
  | 'snapshot_time'
  | 'class_id'
  | 'term_id'
  | 'package_id'
  | 'tianmaocode'
  | 'isLock'
  | 'lockMoney'
  | 'zj_user_id'
  | 'belong_user_id'
  | 'yuan'
  | 'urltype'
  | 'createId'
  | 'uid'
  | 'tuan'
  | 'backkuainum'
  | 'zj_teacher_email'
  | 'zj_classinfo'
  | 'business_class_num'
  | 'order_id'
  | 'toc_package_id'
  | 'toc_package_name'
  | 'toc_term_id'
  | 'toc_term_name'
  | 'toc_class_id'
  | 'toc_class_name'
  | 'is_renling'
  | 'change_num'
  | 'work_name'
  | 'claim_type'
  | 'claim_status'
  | 'back_teacher_email'
  | 'back_toclassinfo'
  | 'back_toc_package_id'
  | 'back_toc_package_name'
  | 'back_toc_term_id'
  | 'back_toc_term_name'
  | 'back_toc_class_id'
  | 'back_toc_class_name'
  | 'back_teacher_name'
  | 'back_num'
  | 'back_old_teacher_email'
  | 'back_old_toclassinfo'
  | 'back_old_teacher_name'
  | 'purchased_id'
  | 'payment_time'
  | 'flag_email'
  | 'toclassinfo'
  | 'zuzhang_email'
  | 'zhuguan_email'
  | 'zj_flag_email'
  | 'zj_toclassinfo'
  | 'hesuan_times'
  | 'jingli_email'
  | 'hesuan_money'
  | 'hand_name'
  | 'claim_tips'
  | 'tuan_teacher'
  | 'payment_method'
  | 'exchange_type'
  | 'before_platform_order_id'
  | 'compensate'
  | 'flagid_name'
  | 'zj_teacher_name';

type ClassDataKeys =
  | 'class_id'
  | 'class_name'
  | 'nickname'
  | 'package_id'
  | 'package_name'
  | 'term_id'
  | 'term_name';
type StudentKeys =
  | 'course_name'
  | 'course_number'
  | 'unlock_time'
  | 'user_id'
  | 'nickname'
  | 'child_name'
  | 'avatar_url'
  | 'sex'
  | 'age'
  | 'phone_number'
  | 'follow_up_desc'
  | 'imageUrl'
  | 'viewing_time'
  | 'n_finish'
  | 'n_open'
  | 'point'
  | 'package_point'
  | 'n_upload_video'
  | 'n_complete_work'
  | 'course_id'
  | 'package_id'
  | 'term_id'
  | 'class_id'
  | 'follow_states'
  | 'n_answer_in_class'
  | 'n_answer_after_class'
  | 'duration_in_class'
  | 'renew_state'
  | 'n_weekly_test'
  | 'address'
  | 'city'
  | 'district'
  | 'parent_name'
  | 'province';

export type OwnerData = {
  id: number;
  name: string;
  username: string; // email
  tuan: number;
  flag: number;
  [key: string]: number | string | null;
};
export type Order = Record<Partial<OrderKeys>, any>;
export type ValidOrderData = {
  order: Order;
  paid?: boolean;
  claimed?: boolean;
};
export type OrderData = ValidOrderData | null;
export type ClassData = Record<Partial<ClassDataKeys>, any>;

export type StudentBE = Record<Partial<StudentKeys>, any>;
export type Student = {
  index: number;
  user_id: number;
  age: number;
  child_name: string;
  parent_name: string;
  nickname: string;
  avatar_url: string;
  phone_number: string;
  province: string;
  city: string;
  district: string;
  address: string;
  contact_name: string;
  phone_number_formatted: string;
};
export type FormData = typeof formData;
export type FormDataKey = keyof FormData;

export type ApiResponse = { res: 'success' | 'error'; [key: string]: any };

export type LogisticItemBE = {
  consigneeId: number;
  goodsDesc: string;
  shippingGoodsDesc: string;
  logisticsState: string;
  waybillStateValue: string;
  deliveryWaybillNo: string;
  consigneePhone: string;
  consigneeName: string;
  province: string;
  city: string;
  county: string;
  streetAddress: string;
  createTime: number;
  deliveryTime: number;
  createByName: string;
  logisticsType: string;
  auditStateValue: string;
  [key: string]: any;
};

export type LogisticItem = {
  phone: string; // used for indexing, not returned from endpoint
  goods_desc: string;
  shipping_goods_desc: string;
  logistics_state: string;
  waybill_state_value: string;
  delivery_waybill_no: string;
  consignee_phone: string;
  consignee_name: string;
  create_time: string;
  delivery_time: string;
  create_by_name: string;
  logistics_type: string;
  audit_state_value: string;
  consignee_province: string;
  consignee_city: string;
  consignee_district: string;
  consignee_address: string;
  delivery_address: string; // full address
};

export type ClassInfoBE = {
  class_id: number;
  class_name: string;
  course_end_date: number;
  course_start_date: number;
  course_state: string;
  package_name: string;
  teacher_id: number;
  teacher_name: string;
  teacher_nickname: string;
  term_id: number;
  term_name: string;
  user_id: number;
};

export type ClassInfo = {
  class_id: number;
  class_name: string;
  course_end_date: number;
  course_start_date: number;
  course_state: string;
  package_name: string;
  teacher_id: number;
  teacher_name: string;
  teacher_nickname: string;
  term_id: number;
  term_name: string;
  user_id: number;
};
