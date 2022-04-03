import { styled } from "@mui/material/styles";
import { Button, Divider } from "@mui/material";
import { FC, useEffect } from "react";
import { ClassData, FormData, FormDataKey } from "../constants/types";
import { classDataToClassInfo } from "../helpers";

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
  useEffect(() => {
    if (!ownerClassesData?.length) return;

    if (
      !ownerClassesData.find(
        (classData) => classDataToClassInfo(classData) === formData.classInfo
      )
    ) {
      modifyFormData("classInfo", classDataToClassInfo(ownerClassesData?.[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerClassesData]);

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
          <span>公司邮箱</span>
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
          <span>班期</span>
          <select
            value={formData.classInfo}
            onChange={(e) => modifyFormData("classInfo", e.target.value.trim())}
          >
            {ownerClassesData?.map((classData) => (
              <option key={classData.class_id}>
                {classDataToClassInfo(classData)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form_item">
        <label>
          <span>项目链接名称</span>
          <input
            type="text"
            id="work_name"
            value={formData.workName}
            onChange={(e) => modifyFormData("workName", e.target.value.trim())}
            placeholder="支持模糊匹配，eg.【高阶】机器人高阶课-6期"
          />
        </label>
      </div>
      <StyledDivider variant="middle" />

      <Button
        variant="contained"
        disabled={queryDisabled}
        onClick={queryHandler}
        style={{ marginRight: "6px" }}
      >
        查询已购买{"|"}已领单
      </Button>
      <Button
        variant="contained"
        disabled={claimDisabled}
        onClick={clickHandler}
        color="error"
      >
        点我领单
      </Button>
    </div>
  );
};

const StyledDivider = styled(Divider)(() => ({
  margin: "10px 0",
}));

export default QueryForm;
