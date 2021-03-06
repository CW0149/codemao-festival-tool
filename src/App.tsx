import { FC, useEffect, useMemo, useState } from 'react';
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
  OrderQuery,
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
  getOrdersDataClaimedBySystem,
  getOwnerByEmail,
  getStudentsByClass,
  testHasAccess,
} from './helpers/requests';
import { formData as MockedFormData } from './mocks/formData';
import {
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  Skeleton,
} from '@mui/material';
import { getColumns } from './constants/columns';
import AlertDialog, { AlertProps } from './components/AlertDialog';
import MoreTools from './components/MoreTools';
import { calculateNewValue } from '@testing-library/user-event/dist/utils';

const LoginAlert: FC<{ enterSystemName: string; systemLink: string }> = ({
  enterSystemName,
  systemLink,
}) => {
  return (
    <Link mr={1} href={systemLink} underline="none">
      <Button variant="contained">{enterSystemName}</Button>
    </Link>
  );
};

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
  const [rows, setRows] = useState<StudentTableRow[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [logisticItems, setLogisticItems] = useState<
    (LogisticItem | undefined)[]
  >([]);
  const [classInfos, setClassInfos] = useState<(ClassInfo | undefined)[]>([]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertProps, setAlertProps] = useState({} as Partial<AlertProps>);

  const paidOrdersData = useMemo(
    () => ordersData.filter((data) => !!data) as ValidOrderData[],
    [ordersData]
  );
  const paidOrders: Order[] = useMemo(
    () => paidOrdersData.map((data) => data.order),
    [paidOrdersData]
  );

  const claimedOrders: Order[] = useMemo(
    () =>
      paidOrdersData.filter((data) => data.claimed).map((data) => data.order),
    [paidOrdersData]
  );

  const claimedOrderSignatures = useMemo(
    () =>
      claimedOrders.map((order) => `${order.phone_number};${order.user_id}`),
    [claimedOrders]
  );
  const notClaimedOrders: Order[] = useMemo(() => {
    const orders = [];

    for (let paid of paidOrders) {
      if (
        !claimedOrderSignatures.find(
          (str) => str.includes(paid.phone_number) || str.includes(paid.user_id)
        )
      ) {
        orders.push(paid);
      }
    }
    return orders;
  }, [claimedOrderSignatures, paidOrders]);

  const claimOrderDisabled = useMemo(
    () => !notClaimedOrders.length,
    [notClaimedOrders]
  );

  const classData = useMemo(
    () => filterOutClassData(formData.classInfo, ownerClassesData),
    [formData.classInfo, ownerClassesData]
  );

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
      if (!formData.token) throw Error('?????????token');

      const owner = await getOwnerByEmail(formData.token, formData.ownerEmail);

      setOwnerData(owner);

      const classesData = await getClassesData(
        formData.token as string,
        owner.id
      );
      setOwnerClassesData(classesData);
      setQueryOrderDisabled(false);
    } catch (err) {
      setAlertOpen(true);
      setAlertProps({
        title: String(err),
        description: `????????????????????????????????????????????????????????????????????????????????????????????????????????????`,
        dialogActions: (
          <LoginAlert
            systemLink="https://festival.codemao.cn/h5/yybAdmin/"
            enterSystemName="??????????????????"
          />
        ),
      });
    }
  };

  const getStudentsByClassInfo = async () => {
    if (!classData) return;

    setIsQueryingStudents(true);

    try {
      const classStudents = await getStudentsByClass(
        classData.class_id,
        classData.term_id
      );

      if (!classStudents?.length) {
        alert('???????????????????????????????????????????????????');
        return;
      }

      setIsQueryingStudents(false);
      setClassStudents(classStudents);
    } catch (err) {
      setAlertOpen(true);
      setAlertProps({
        title: String(err),
        description: `?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????`,
        dialogActions: (
          <LoginAlert
            systemLink="https://internal-account.codemao.cn/"
            enterSystemName="???????????????????????????"
          />
        ),
      });

      setIsQueryingStudents(false);
    }
  };

  const queryOrdersHandler = async (
    formData: FormData,
    isQuerySystemClaimed?: boolean
  ) => {
    if (!formData.token) {
      console.log('?????????token');
      return;
    }
    if (!classStudents.length || !ownerData) return;

    setQueryOrderDisabled(true);

    const queries = selectedStudents.map(
      (stu): OrderQuery => ({
        userId: String(stu.user_id),
      })
    );
    const hasAccess = await testHasAccess(formData.token, queries[0]);

    if (hasAccess) {
      setOrdersData([]);

      let ordersData = [];
      if (isQuerySystemClaimed) {
        ordersData = await getOrdersDataClaimedBySystem(
          formData.token,
          formData.classInfo
        );
      } else {
        ordersData = await getOrdersData(
          formData.token,
          queries,
          formData.workName,
          formData.classInfo
        );
      }

      setOrdersData(ordersData);
    } else {
      alert('???????????????');
    }

    setQueryOrderDisabled(false);
  };

  const claimOrdersHandler = async (formData: FormData) => {
    if (!formData.token) {
      console.log('?????????token');
      return;
    }
    if (!ownerData) return;

    if (!ordersData.length) {
      alert('????????????');
    }

    if (notClaimedOrders.length) {
      await claimOrders(
        formData.token,
        notClaimedOrders,
        formData.classInfo,
        ownerData
      );
      await queryOrdersHandler(formData, false);
      alert('??????????????????????????????????????????????????????');
    }
  };

  const setAlertOpenFn = (open: boolean) => () => setAlertOpen(open);

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
                alert('????????????????????????');
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
                alert('??????????????????????????????');
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
          <MoreTools
            filename={formData.classInfo}
            rows={rows}
            columns={getColumns(
              !!paidOrders.length,
              !!claimedOrders.length,
              !!logisticItems.length,
              !!classInfos.length
            ).map((item) => ({ id: item.id, displayName: item.label }))}
          />
        </Grid>
      </Grid>
      <Divider sx={{ margin: '10px 0' }} />

      <div className="results">
        {isQueryingStudents ? (
          <>
            <Skeleton width={500} height={30} />

            {[...Array(11)].map((item) => (
              <Skeleton height={`calc((100vh - 200px) / 12)`} />
            ))}
          </>
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
              claimedOrders={claimedOrders}
              logisticItems={logisticItems}
              classInfos={classInfos}
              setRows={setRows}
            />
          </>
        )}
      </div>

      <AlertDialog
        open={alertOpen}
        setOpen={setAlertOpenFn}
        title={alertProps.title}
        description={alertProps.description}
        dialogActions={alertProps.dialogActions}
      />
    </div>
  );
};

export default App;
