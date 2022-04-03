import { Button } from "@mui/material";
import { FC } from "react";
import { ClassData, FormData, FormDataKey } from "../constants/types";

type QueryFormProps = {
  onQueryOrders: (formData: FormData) => void;
  onClaimOrders: (FormData: FormData) => void;
  setFormData: (callback: (newData: FormData) => FormData) => void;
  queryDisabled: boolean;
  claimDisabled: boolean;
  formData: FormData;
  ownerClassesData?: ClassData[];
};
const QueryForm: FC<QueryFormProps> = ({
  onQueryOrders,
  onClaimOrders,
  queryDisabled,
  claimDisabled,
  setFormData,
  formData,
  ownerClassesData,
}) => {
  const modifyFormData = (key: FormDataKey, value: string) => {
    setFormData((prevData) => {
      return { ...prevData, [key]: value };
    });
  };

  const testValidData = () => {
    let valid = true;

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
      onQueryOrders(formData);
    }
  };

  const clickHandler = () => {
    if (testValidData()) {
      onClaimOrders(formData);
    }
  };

  return (
    <div className="form_wrapper">
      <div className="form_item">
        <label>
          <span>下单链接名称</span>
          <input
            type="text"
            id="work_name"
            value={formData.workName}
            onChange={(e) => modifyFormData("workName", e.target.value.trim())}
            placeholder="支持模糊匹配，eg.【高阶】机器人高阶课-6期"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>归属人邮箱</span>
          <input
            type="text"
            value={formData.ownerEmail}
            onChange={(e) =>
              modifyFormData("ownerEmail", e.target.value.trim())
            }
            placeholder="可选，若归属人有重名必填"
          />
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>设置归属班期</span>
          <select
            value={formData.classInfo}
            onChange={(e) => modifyFormData("classInfo", e.target.value.trim())}
          >
            {ownerClassesData?.map((classData) => (
              <option key={classData.class_id}>
                {classData.package_name +
                  classData.term_name +
                  classData.class_name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="btns">
        <Button
          variant="contained"
          disabled={queryDisabled}
          onClick={queryHandler}
        >
          查询
        </Button>
        <Button
          variant="contained"
          disabled={claimDisabled}
          onClick={clickHandler}
          color="error"
        >
          点我领单-请确保归属信息准确
        </Button>
      </div>
    </div>
  );
};

export default QueryForm;
