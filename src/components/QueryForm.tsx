import { styled } from '@mui/material/styles';
import {
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { ClassData, FormData, FormDataKey } from '../constants/types';
import { classDataToClassInfo } from '../helpers';
import { Box } from '@mui/system';

type QueryFormProps = {
  onQueryOrders: (formData: FormData) => void;
  onClaimOrders: (FormData: FormData) => void;
  onQueryLogistics: () => void;
  onQueryPreviousClassInfo: () => void;
  setFormData: (callback: (newData: FormData) => FormData) => void;
  queryDisabled: boolean;
  claimDisabled: boolean;
  getLogisticDisabled: boolean;
  getPreviousClassInfoDisabled: boolean;
  formData: FormData;
  ownerClassesData?: ClassData[];
};
const QueryForm: FC<QueryFormProps> = ({
  onQueryOrders,
  onClaimOrders,
  onQueryLogistics,
  onQueryPreviousClassInfo,
  queryDisabled,
  claimDisabled,
  getLogisticDisabled,
  getPreviousClassInfoDisabled,
  setFormData,
  formData,
  ownerClassesData,
}) => {
  const [email, setEmail] = useState(formData.ownerEmail);

  useEffect(() => {
    if (!ownerClassesData?.length) return;

    const selected = ownerClassesData.find(
      (classData) =>
        classDataToClassInfo(classData) === formData.classInfo.trim()
    );

    modifyFormData(
      'classInfo',
      classDataToClassInfo(selected || ownerClassesData?.[0])
    );

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
      alert('请输入token');
      valid = false;
    }
    if (!formData.workName) {
      alert('请输入项目链接名');
      valid = false;
    }
    if (!formData.classInfo) {
      alert('请输入班级');
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

  const modifyEmail = useCallback(
    debounce((value: string) => {
      modifyFormData('ownerEmail', value);
    }, 300),
    []
  );

  return (
    <Grid container spacing={1}>
      <Grid item md={12} xs={12}>
        <Box sx={{ p: 1, pt: 2, background: '#fff', borderRadius: '4px' }}>
          <Grid container spacing={1}>
            <Grid item md={6} xs={6}>
              <TextField
                size="small"
                fullWidth
                label="公司邮箱"
                value={email}
                onChange={(e) => {
                  const newValue = e.target.value.trim();

                  setEmail(newValue);
                  modifyEmail(newValue);
                }}
                placeholder="可选，若归属人有重名必填"
              />
            </Grid>
            <Grid item md={6} xs={6}>
              <FormControl fullWidth>
                <InputLabel>班级</InputLabel>
                <Select
                  size="small"
                  label="班级"
                  value={formData.classInfo}
                  onChange={(e) =>
                    modifyFormData('classInfo', e.target.value.trim())
                  }
                >
                  {ownerClassesData?.map((classData) => (
                    <MenuItem
                      key={classData.class_id}
                      value={classDataToClassInfo(classData)}
                    >
                      {classDataToClassInfo(classData)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Grid>
      <Grid item md={4} xs={12}>
        <Box sx={{ p: 1, pt: 2, background: '#fff', borderRadius: '4px' }}>
          <Grid container spacing={1}>
            <Grid item md={12} xs={6}>
              <TextField
                size="small"
                fullWidth
                label="内部物料"
                value={formData.shippingGoodsDesc}
                onChange={(e) =>
                  modifyFormData('shippingGoodsDesc', e.target.value.trim())
                }
              />
            </Grid>
            <Grid item md={12} xs={6}>
              <Button
                id="logistic_btn"
                fullWidth
                variant="contained"
                disabled={getLogisticDisabled}
                onClick={onQueryLogistics}
              >
                获取物流信息
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item md={4} xs={12}>
        <Box sx={{ p: 1, pt: 2, background: '#fff', borderRadius: '4px' }}>
          <Grid container spacing={1}>
            <Grid item md={12} xs={6}>
              <TextField
                size="small"
                fullWidth
                label="学生来自"
                value={formData.packageName}
                onChange={(e) =>
                  modifyFormData('packageName', e.target.value.trim())
                }
              />
            </Grid>
            <Grid item md={12} xs={6}>
              <Button
                id="logistic_btn"
                fullWidth
                variant="contained"
                disabled={getPreviousClassInfoDisabled}
                onClick={onQueryPreviousClassInfo}
              >
                获取原班主任信息
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item md={4} xs={12}>
        <Box sx={{ p: 1, pt: 2, background: '#fff', borderRadius: '4px' }}>
          <Grid container spacing={1}>
            <Grid item md={12} xs={6}>
              <TextField
                size="small"
                fullWidth
                label="项目链接名称"
                id="work_name"
                value={formData.workName}
                onChange={(e) =>
                  modifyFormData('workName', e.target.value.trim())
                }
                placeholder="支持模糊匹配，eg.【高阶】机器人高阶课-6期"
              />
            </Grid>
            <Grid item md={12} xs={6}>
              <Grid container spacing={1}>
                <Grid item md={6} xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={queryDisabled}
                    onClick={queryHandler}
                    style={{ marginRight: '10px' }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      查询已购买{'|'}已领单
                    </span>
                  </Button>
                </Grid>
                <Grid item md={6} xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={claimDisabled}
                    onClick={clickHandler}
                    color="error"
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      点我自动领单
                    </span>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

const StyledDivider = styled(Divider)(() => ({
  margin: '10px 0 10px 0',
  borderStyle: 'dotted',
}));

export default QueryForm;
