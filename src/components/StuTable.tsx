import { FC, useEffect, useMemo, useState } from "react";
import { Student } from "../constants/types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import EnhancedTableHead, { HeadCell } from "./common/EnhancedTableHead";
import { getComparator, Order } from "../helpers";

type ToShownKeys =
  | "user_id"
  | "child_name"
  | "age"
  | "nickname"
  | "avatar_url"
  | "phone_number"
  | "follow_up_desc";

type StuTableProps = {
  data: Student[];
  paidOrderUserIds: string[];
  claimedOrderUserIds: string[];
};
const StuTable: FC<StuTableProps> = ({
  data,
  paidOrderUserIds,
  claimedOrderUserIds,
}) => {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("");
  const [rows, setRows] =
    useState<(Student & { paid?: string; claimed?: string })[]>(data);

  const paidUserIdsSet = useMemo(
    () => new Set(paidOrderUserIds.map((id) => String(id))),
    [paidOrderUserIds]
  );
  const claimedUserIdsSet = useMemo(
    () => new Set(claimedOrderUserIds.map((id) => String(id))),
    [claimedOrderUserIds]
  );

  useEffect(() => {
    setRows(data);
  }, [data]);

  useEffect(() => {
    if (paidOrderUserIds.length) {
      setRows((prevRows) =>
        prevRows.map((row) => {
          const value = paidUserIdsSet.has(String(row.user_id)) ? "是" : "-";
          return {
            ...row,
            paid: value,
          };
        })
      );
    }
    if (claimedOrderUserIds.length) {
      setRows((prevRows) =>
        prevRows.map((row) => {
          const value = claimedUserIdsSet.has(String(row.user_id)) ? "是" : "-";
          return {
            ...row,
            claimed: value,
          };
        })
      );
    }
  }, [
    paidOrderUserIds,
    claimedOrderUserIds,
    paidUserIdsSet,
    claimedUserIdsSet,
  ]);

  if (!data.length) return null;

  const hasPaidOrders = paidOrderUserIds.length > 0;
  const hasClaimedOrders = claimedOrderUserIds.length > 0;

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", height: "100%" }}>
      <TableContainer sx={{ height: "100%" }}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          stickyHeader
          aria-label="sticky table"
        >
          <EnhancedTableHead
            onRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
            headCells={[
              {
                id: "user_id",
                numeric: false,
                disablePadding: true,
                label: "用户ID",
                align: "center",
              },
              {
                id: "child_name",
                numeric: false,
                disablePadding: false,
                label: "学生",
              },
              {
                id: "nickname",
                numeric: false,
                disablePadding: false,
                label: "昵称",
              },
              ...(hasPaidOrders
                ? [
                    {
                      id: "paid",
                      numeric: false,
                      disablePadding: false,
                      label: "已购买",
                      align: "center",
                    } as HeadCell,
                  ]
                : []),
              ...(hasClaimedOrders
                ? [
                    {
                      id: "claimed",
                      numeric: false,
                      disablePadding: false,
                      label: "已领单",
                      align: "center",
                    } as HeadCell,
                  ]
                : []),
              {
                id: "age",
                numeric: true,
                disablePadding: false,
                label: "年龄",
              },
              {
                id: "phone_number",
                numeric: false,
                disablePadding: false,
                label: "电话",
                align: "center",
              },
              {
                id: "follow_up_desc",
                numeric: false,
                disablePadding: false,
                label: "描述",
                align: "center",
              },
            ]}
          />
          <TableBody>
            {rows
              .slice()
              .sort(getComparator(order, orderBy))
              .map((row) => (
                <StyledTableRow
                  key={row.user_id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{row.user_id}</TableCell>
                  <TableCell>{row.child_name}</TableCell>
                  <TableCell>
                    <img src={row.avatar_url} className="avatar" alt="avatar" />
                    &nbsp;
                    {row.nickname}
                  </TableCell>
                  {hasPaidOrders && (
                    <TableCell align="center">
                      <span
                        style={{
                          color: row.paid !== row.claimed ? "red" : undefined,
                        }}
                      >
                        {row.paid}
                      </span>
                    </TableCell>
                  )}
                  {hasClaimedOrders && (
                    <TableCell align="center">
                      <span
                        style={{
                          color: row.paid !== row.claimed ? "red" : undefined,
                        }}
                      >
                        {row.claimed}
                      </span>
                    </TableCell>
                  )}
                  <TableCell align="right">{row.age}</TableCell>
                  <TableCell>{row.phone_number}</TableCell>
                  <TableCell>{row.follow_up_desc}</TableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default StuTable;
