import { FC } from "react";
import { Student } from "../constants/types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

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
  if (!data.length) return null;

  const hasPaidOrders = paidOrderUserIds.length > 0;
  const hasClaimedOrders = claimedOrderUserIds.length > 0;

  const paidUserIdsSet = new Set(paidOrderUserIds.map((id) => String(id)));
  const claimedUserIdsSet = new Set(
    claimedOrderUserIds.map((id) => String(id))
  );

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", height: "100%" }}>
      <TableContainer sx={{ height: "100%" }}>
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          stickyHeader
          aria-label="sticky table"
        >
          <TableHead>
            <TableRow>
              <TableCell>用户ID</TableCell>
              <TableCell align="left">学生</TableCell>
              <TableCell align="left">昵称</TableCell>
              <TableCell align="center">年龄</TableCell>
              <TableCell align="center">电话</TableCell>
              {hasPaidOrders && <TableCell align="center">已购买</TableCell>}
              {hasClaimedOrders && <TableCell align="center">已领单</TableCell>}

              <TableCell align="center">描述</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((stu) => (
              <StyledTableRow
                key={stu.user_id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{stu.user_id}</TableCell>
                <TableCell>{stu.child_name}</TableCell>
                <TableCell>
                  <img src={stu.avatar_url} className="avatar" alt="avatar" />
                  &nbsp;
                  {stu.nickname}
                </TableCell>
                <TableCell>{stu.age}</TableCell>
                <TableCell>{stu.phone_number}</TableCell>
                {hasPaidOrders && (
                  <TableCell align="center">
                    <span
                      style={{
                        color:
                          paidUserIdsSet.has(String(stu.user_id)) !==
                          claimedUserIdsSet.has(String(stu.user_id))
                            ? "red"
                            : undefined,
                      }}
                    >
                      {paidUserIdsSet.has(String(stu.user_id)) ? "是" : "-"}
                    </span>
                  </TableCell>
                )}
                {hasClaimedOrders && (
                  <TableCell align="center">
                    <span
                      style={{
                        color:
                          paidUserIdsSet.has(String(stu.user_id)) !==
                          claimedUserIdsSet.has(String(stu.user_id))
                            ? "red"
                            : undefined,
                      }}
                    >
                      {claimedUserIdsSet.has(String(stu.user_id)) ? "是" : "-"}
                    </span>
                  </TableCell>
                )}
                <TableCell>{stu.follow_up_desc}</TableCell>
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
