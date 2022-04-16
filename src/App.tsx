import { FC, useEffect, useMemo, useState } from 'react';
import CsvDownloader from 'react-csv-downloader';
import './App.css';
import QueryForm from './components/QueryForm';
import Summary from './components/Summary';
import StuTable, { StudentTableRow } from './components/StuTable';
import {
  ClassData,
  ClassInfo,
  FormData,
  LogisticItem,
  Order,
  OrderData,
  OwnerData,
  Student,
  ValidOrderData,
} from './constants/types';
import {
  claimOrders,
  filterOutClassData,
  getClassesData,
  getMatchedClassInfosByPackageNames,
  getMatchedLogicsByPhones,
  getOrdersData,
  getOwnerByEmail,
  getStudentsByClass,
  testHasAccess,
} from './helpers/requests';
import { formData as MockedFormData } from './mocks/formData';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
} from '@mui/material';
import { getColumns } from './constants/columns';

const App: FC = () => {
  const [ordersData, setOrdersData] = useState([] as OrderData[]);
  const [queryOrderDisabled, setQueryOrderDisabled] = useState(true);
  const [getLogisticDisabled, setGetLogisticDisabled] = useState(true);
  const [getPreviousClassInfoDisabled, setGetPreviousClassInfoDisabled] =
    useState(true);
  const [isQueryingStudents, setIsQueryingStudents] = useState(false);

  const [formData, setFormData] = useState<FormData>(MockedFormData);
  const [ownerData, setOwnerData] = useState<OwnerData>();
  const [ownerClassesData, setOwnerClassesData] = useState<ClassData[]>();
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [logisticItems, setLogisticItems] = useState<
    (LogisticItem | undefined)[]
  >([]);
  const [classInfos, setClassInfos] = useState<(ClassInfo | undefined)[]>([]);

  const paidOrdersData = useMemo(
    () => ordersData.filter((data) => !!data) as ValidOrderData[],
    [ordersData]
  );
  const paidOrders: Order[] = useMemo(
    () => paidOrdersData.map((data) => data.order),
    [paidOrdersData]
  );
  const paidOrderUserIds = useMemo(
    () => paidOrders.map((order) => order.user_id),
    [paidOrders]
  );

  const claimedOrders: Order[] = useMemo(
    () =>
      paidOrdersData.filter((data) => data.claimed).map((data) => data.order),
    [paidOrdersData]
  );
  const claimedOrderUserIds = useMemo(
    () => claimedOrders.map((order) => order.user_id),
    [claimedOrders]
  );
  const notClaimedOrders: Order[] = useMemo(() => {
    const orders = [];
    const claimedIdSet = new Set(claimedOrderUserIds);

    for (let paid of paidOrders) {
      if (!claimedIdSet.has(paid.user_id)) {
        orders.push(paid);
      }
    }
    return orders;
  }, [claimedOrderUserIds, paidOrders]);

  const claimOrderDisabled = useMemo(
    () => !notClaimedOrders.length,
    [notClaimedOrders]
  );

  const [rows, setRows] = useState<StudentTableRow[]>([]);

  useEffect(() => {
    setSelectedStudents(classStudents);
  }, [classStudents]);

  useEffect(() => {
    if (selectedStudents) {
      setRows(selectedStudents);
    }
  }, [selectedStudents]);

  useEffect(() => {
    getClassesDataByEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.ownerEmail]);

  useEffect(() => {
    if (!classStudents?.length) {
      getStudentsByClassInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerClassesData]);

  useEffect(() => {
    getStudentsByClassInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.classInfo]);

  useEffect(() => {
    setQueryOrderDisabled(isQueryingStudents);
    setGetLogisticDisabled(isQueryingStudents);
    setGetPreviousClassInfoDisabled(isQueryingStudents);

    if (isQueryingStudents) {
      setClassStudents([]);
      setOrdersData([]);
      setLogisticItems([]);
      setClassInfos([]);
    }
  }, [isQueryingStudents]);

  useEffect(() => {
    setOrdersData([]);
    setLogisticItems([]);
  }, [selectedStudents]);

  const getClassesDataByEmail = async () => {
    try {
      if (!formData.token) throw Error('请设置token');

      getOwnerByEmail(formData.token, formData.ownerEmail).then((owner) => {
        setOwnerData(owner);
        getClassesData(formData.token as string, owner.id).then(
          (classesData) => {
            setOwnerClassesData(classesData);
            setQueryOrderDisabled(false);
          }
        );
      });
    } catch (err) {
      setQueryOrderDisabled(true);
      alert(err);
    }
  };

  const getStudentsByClassInfo = () => {
    if (!ownerClassesData?.length) return;

    const classData = filterOutClassData(formData.classInfo, ownerClassesData);
    if (!classData) return;

    setIsQueryingStudents(true);

    getStudentsByClass(classData.class_id, classData.term_id).then(
      (classStudents = []) => {
        setIsQueryingStudents(false);
        setClassStudents(classStudents);

        if (!classStudents?.length) {
          alert('未获取到学生列表，请重试或刷新页面');
        }
      }
    );
  };

  const queryOrdersHandler = async (formData: FormData) => {
    if (!formData.token) {
      console.log('请设置token');
      return;
    }
    if (!classStudents.length || !ownerData) return;

    setQueryOrderDisabled(true);

    const ids = selectedStudents.map((stu) => String(stu.user_id));
    const hasAccess = await testHasAccess(formData.token, ids[0]);

    if (hasAccess) {
      setOrdersData([]);

      const ordersData = await getOrdersData(
        formData.token,
        ids,
        formData.workName,
        ownerData.name
      );
      setOrdersData(ordersData);
    } else {
      alert('登录已过期');
    }

    setQueryOrderDisabled(false);
  };

  const claimOrdersHandler = async (formData: FormData) => {
    if (!formData.token) {
      console.log('请设置token');
      return;
    }
    if (!ownerData) return;

    if (!ordersData.length) {
      alert('请先查询');
    }

    if (notClaimedOrders.length) {
      await claimOrders(
        formData.token,
        notClaimedOrders,
        formData.classInfo,
        ownerData
      );
      await queryOrdersHandler(formData);
      alert('已重新获取数据，也可以去系统查看验证');
    }
  };

  return (
    <div className="App">
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item md={10} xs={12}>
          <QueryForm
            isQueryingStudents={isQueryingStudents}
            onQueryOrders={queryOrdersHandler}
            onClaimOrders={claimOrdersHandler}
            queryOrderDisabled={queryOrderDisabled}
            claimOrderDisabled={claimOrderDisabled}
            formData={formData}
            setFormData={setFormData}
            ownerClassesData={ownerClassesData}
            getLogisticDisabled={getLogisticDisabled}
            getPreviousClassInfoDisabled={getPreviousClassInfoDisabled}
            onQueryLogistics={async () => {
              if (!formData.shippingGoodsDesc) {
                alert('请输入内部物料名');
                return;
              }

              setGetLogisticDisabled(true);

              const items = await getMatchedLogicsByPhones(
                selectedStudents.map((stu) => stu.phone_number),
                formData.shippingGoodsDesc
              );
              setLogisticItems(items);
              setGetLogisticDisabled(false);
            }}
            onQueryPreviousClassInfo={async () => {
              if (!formData.packageName) {
                alert('请输入学生来自的课程');
                return;
              }

              setGetPreviousClassInfoDisabled(true);

              const items = await getMatchedClassInfosByPackageNames(
                selectedStudents.map((stu) => stu.user_id),
                formData.packageName
              );
              setClassInfos(items);
              setGetPreviousClassInfoDisabled(false);
            }}
            classStudents={classStudents}
            selectedStudents={selectedStudents}
            setSelectedStudents={setSelectedStudents}
          />
        </Grid>
        <Grid item md={2} xs={12}>
          <Box sx={{ p: 1, background: '#fff' }}>
            <CsvDownloader
              filename={`${formData.classInfo}`}
              datas={rows}
              columns={getColumns(
                !!paidOrders.length,
                !!claimedOrders.length,
                !!logisticItems.length,
                !!classInfos.length
              ).map((item) => ({ id: item.id, displayName: item.label }))}
            >
              <Button variant="contained" sx={{ width: '100%' }}>
                导出表格
              </Button>
            </CsvDownloader>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ margin: '10px 0' }} />

      <div className="results">
        {isQueryingStudents ? (
          <Container
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Container>
        ) : (
          <>
            <Summary
              ordersData={ordersData}
              notClaimedOrders={notClaimedOrders}
              claimedOrders={claimedOrders}
              paidOrders={paidOrders}
              classInfo={formData.classInfo}
              classStudents={classStudents}
              selectedStudents={selectedStudents}
            />
            <StuTable
              teacherName={ownerData?.name}
              data={rows}
              paidOrders={paidOrders}
              paidOrderUserIds={paidOrderUserIds}
              claimedOrderUserIds={claimedOrderUserIds}
              logisticItems={logisticItems}
              classInfos={classInfos}
              setRows={setRows}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
