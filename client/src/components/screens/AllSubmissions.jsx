import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Card, CardContent, InputBase } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api.js";
import Navbar from "../Navbar.jsx";
import SearchIcon from "@mui/icons-material/Search";
import '@fontsource/roboto-slab';
import CodeIcon from '@mui/icons-material/Code';
import CodeModal from "../CodeModal.jsx";

const createData = (id, user, result, language, submissionDate, code) => {
    return {
        id,
        user,
        result,
        language,
        submissionDate,
        code,
    };
};

const EnhancedTable = () => {
    const { id } = useParams();

    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState([]);
    const [filteredRows, setFilteredRows] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState("");

    const navigate = useNavigate();
    const [problem, setProblem] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [currentCode, setCurrentCode] = React.useState("");
    const [currentResult, setCurrentResult] = React.useState("");

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await api.get(`/problem/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const fetchedProblem = res.data.problem;
                setProblem(fetchedProblem);

                const rowsData = fetchedProblem.submissions.map((submission, index) =>
                    createData(
                        index,
                        submission.user,
                        submission.result,
                        submission.language,
                        submission.submissionDate,
                        submission.code,
                    )
                );
                setRows(rowsData);
                setFilteredRows(rowsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event) => {
        setDense(event.target.checked);
    };

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

    const visibleRows = React.useMemo(
        () =>
            stableSort(filteredRows, getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [order, orderBy, page, rowsPerPage, filteredRows]
    );

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setSearchTerm(searchTerm);
        const filtered = rows.filter((row) =>
            row.user.toLowerCase().includes(searchTerm)
        );
        setFilteredRows(filtered);
        setPage(0);
    };

    const handleOpen = (code, result) => {
        setCurrentCode(code);
        setCurrentResult(result);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Navbar />
            <Box sx={{ width: "100%", minHeight: "100vh", p: 2, backgroundColor: "#f0f4f8" }}>
                <Card className="mx-auto mt-4 p-2 text-center" sx={{ backgroundColor: "#f2f2f2" }}>
                    <CardContent>
                        <Paper className="mb-2 p-4" sx={{ backgroundColor: "white", borderRadius: 10, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                            <EnhancedTableToolbar handleSearch={handleSearch} searchTerm={searchTerm} />
                            <TableContainer>
                                <Table
                                    sx={{ minWidth: 750 }}
                                    aria-labelledby="tableTitle"
                                    size={dense ? "small" : "medium"}
                                    className="w-full"
                                >
                                    <EnhancedTableHead
                                        order={order}
                                        orderBy={orderBy}
                                        onRequestSort={handleRequestSort}
                                        rowCount={filteredRows.length}
                                    />
                                    <TableBody>
                                        {visibleRows.map((row, index) => {
                                            const labelId = `enhanced-table-checkbox-${index}`;

                                            return (
                                                <TableRow
                                                    hover
                                                    tabIndex={-1}
                                                    key={row.id}
                                                    className="cursor-pointer hover:bg-gray-100"
                                                >
                                                    <TableCell align="left">{row.user}</TableCell>
                                                    <TableCell
                                                        component="th"
                                                        id={labelId}
                                                        scope="row"
                                                        padding="none"
                                                    >
                                                        <Link
                                                            to={`/problem/${id}`}
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            {problem.title}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="left">{row.result}</TableCell>
                                                    <TableCell align="left">{row.language}</TableCell>
                                                    <TableCell align="left">{new Date(row.submissionDate).toLocaleDateString()}</TableCell>
                                                    <TableCell align="left">
                                                        <IconButton
                                                            onClick={() => handleOpen(row.code, row.result)}
                                                            sx={{
                                                                backgroundColor: 'red',
                                                                color: 'white',
                                                                padding: '5px 10px',
                                                                borderRadius: '10px',
                                                                '&:hover': {
                                                                    backgroundColor: 'darkred',
                                                                },
                                                                minWidth: '30px',
                                                                minHeight: '30px',
                                                            }}
                                                        >
                                                            <CodeIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {emptyRows > 0 && (
                                            <TableRow
                                                style={{
                                                    height: (dense ? 33 : 53) * emptyRows,
                                                }}
                                                colSpan={6}
                                            />
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredRows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </Paper>
                        <FormControlLabel
                            control={<Switch checked={dense} onChange={handleChangeDense} />}
                            label="Dense padding"
                        />
                    </CardContent>
                </Card>
            </Box>
            <CodeModal open={open} handleClose={handleClose} code={currentCode} result={currentResult}/>
        </div>
    );
};

const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
};

const getComparator = (order, orderBy) => {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
};

const headCells = [
    {
        id: "user",
        numeric: false,
        disablePadding: true,
        label: "User",
    },
    {
        id: "problem",
        numeric: false,
        disablePadding: false,
        label: "Problem",
    },
    {
        id: "result",
        numeric: false,
        disablePadding: false,
        label: "Result",
    },
    {
        id: "language",
        numeric: true,
        disablePadding: false,
        label: "Language",
    },
    {
        id: "submissionDate",
        numeric: false,
        disablePadding: false,
        label: "Submission Date",
    },
    {
        id: "code",
        numeric: false,
        disablePadding: false,
        label: "Code",
    },
];

const EnhancedTableHead = (props) => {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align="left"
                        padding={headCell.disablePadding ? "none" : "normal"}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(["asc", "desc"]).isRequired,
    orderBy: PropTypes.string.isRequired,
};

const EnhancedTableToolbar = ({ handleSearch, searchTerm }) => {
    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                flexDirection: "row",
                justifyContent: "space-between",
            }}
        >
            <Typography
                sx={{
                    flex: "1 1 100%",
                    fontFamily: 'Roboto Slab, serif',
                    fontWeight: 'bold',
                }}
                variant="h4"
                id="tableTitle"
                component="div"
            >
                All Submissions
            </Typography>
            <Paper
                component="form"
                sx={{ p: "2px 4px", display: "flex", alignItems: "center", maxWidth: 400, borderRadius: 5, backgroundColor: '#ffffff' }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search Users"
                    inputProps={{ "aria-label": "search problems" }}
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
                    <SearchIcon />
                </IconButton>
            </Paper>
            <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    handleSearch: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
};

export default EnhancedTable;
