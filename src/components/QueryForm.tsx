import React, { FC, useState } from "react";
import { formData as MockedFormData } from "../mocks/formData";
import { FormData, FormDataKey } from "../constants/types";

type QueryFormProps = {
  onQueryOrder: (formData: FormData) => void;
  onClaimOrder: (FormData: FormData) => void;
  queryDisabled: boolean;
  claimDisabled: boolean;
};
const QueryForm: FC<QueryFormProps> = ({
  onQueryOrder,
  onClaimOrder,
  queryDisabled,
  claimDisabled,
}) => {
  const [formData, setFormData] = useState(MockedFormData);

  const modifyFormData = (key: FormDataKey, value: string) => {
    setFormData((prevData) => {
      return { ...prevData, [key]: value };
    });
  };

  const testValidData = () => {
    let valid = true;

    if (!formData.ids) {
      alert("请输入用户ID");
      valid = false;
    }
    if (!formData.owner) {
      alert("请输入归属人");
      valid = false;
    }
    if (!formData.token) {
      alert("请输入token");
      valid = false;
    }
    if (!formData.workName) {
      alert("请输入项目链接名");
      valid = false;
    }
    if (!formData.classInfo) {
      alert("请输入班期");
      valid = false;
    }
    return valid;
  };

  const queryHandler = () => {
    if (testValidData()) {
      onQueryOrder(formData);
    }
  };

  const clickHandler = () => {
    if (testValidData()) {
      onClaimOrder(formData);
    }
  };

  return (
    <>
      <div>
        <label>
          <span>用户ID</span>
          <textarea
            name="用户ID"
            id="user_ids"
            cols={30}
            rows={10}
            value={formData.ids}
            onChange={(e) => modifyFormData("ids", e.target.value)}
            placeholder="请粘贴入用户ID，ID用换行分隔
eg.
6540093
17436072
13298232
"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>项目链接名称</span>
          <input
            type="text"
            id="work_name"
            value={formData.workName}
            onChange={(e) => modifyFormData("workName", e.target.value)}
            placeholder="支持模糊匹配，eg.【高阶】机器人高阶课-6期"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>归属人</span>
          <input
            type="text"
            id="flagid_name"
            value={formData.owner}
            onChange={(e) => modifyFormData("owner", e.target.value)}
            width="200"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>token</span>
          <input
            type="text"
            id="token"
            value={formData.token}
            onChange={(e) => modifyFormData("token", e.target.value)}
            width="200"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>班期</span>
          <input
            type="text"
            id="classinfo"
            width="200"
            value={formData.classInfo}
            onChange={(e) => modifyFormData("classInfo", e.target.value)}
            placeholder="查询可选，领单必填"
          />
        </label>
      </div>
      <div className="btns">
        <button id="query_btn" disabled={queryDisabled} onClick={queryHandler}>
          查询
        </button>
        <button id="claim_btn" disabled={claimDisabled} onClick={clickHandler}>
          请确保上面信息准确-后果自负-自动领单
        </button>
      </div>
      <hr />
    </>
  );
};

export default QueryForm;
