import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import axios from "axios";
import style from "@styles/SimpleTable.module.css";
import ModalEditar from "./ModalEditar";
import { Delete, Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import useAlert from "@hooks/useAlert";
import Alerta from "@components/Alert";

export function SimpleTable() {
  const [data, setData] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { alert, setAlert, toggleAlert } = useAlert();
  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Modelo", accessorKey: "modelo" },
    { header: "Directorio", accessorKey: "directorio_contenido" },
    { header: "Clave", accessorKey: "clave" },
    { header: "Protocolo", accessorKey: "protocolo" },
    { header: "Marca", accessorKey: "marca" },
    { header: "IP", accessorKey: "ip" },
    { header: "Usuario", accessorKey: "usuario" },
    { header: "Serial", accessorKey: "serial" },
  ];
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState("");
  const [selected, setSelected] = useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filtering,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
  });

  //Manejar cierre del modal
  const handleClose = () => {
    setShowModal(false);
  };

  //funcion para abrir el modal
  const handleOpen = (row) => {
    setSelected(row);
    setShowModal(true);
  };

  const handleNextPage = () => {
    let num = page + 1;
    setPage(num);
    getCameras(num);
    table.nextPage();
  };

  const handlePrevPage = () => {
    let num = page;
    if (page > 1) {
      num = page - 1;
      setPage(num);
    }
    getCameras(num);
    table.previousPage();
  };

  const getCameras = async (num = 1) => {
    await axios
      .get(`http://localhost:8001/camaras?pag=${num}&ord=DESC`, {timeout: 5000})
      .then((response) => {
        setData(response.data.result);
        // setMaxPages(response.data.totalPages);
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.log("Error al cargar");
        } 
        console.log(error);
      });
  };

  useEffect(() => {
    getCameras().then(() => {
      setIsLoading(false);
    });
  }, []);

  const handleDelete = async (row) => {
    const confirmacion = window.confirm("¿Quieres eliminar este elemento?");
    if (confirmacion) {
      try {
        // Elimina utilizando Axios
        const response = await axios.delete(
          `http://127.0.0.1:8001/camaras/${row.id}`
        );
        if (response.status == 200) {
          setAlert({
            active: true,
            type: "success",
            message: "Eliminado con exito",
            autoClose: true,
          });
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div>
      {!isLoading && data.length > 0 ? (
        <>
          <TableContainer>
            <Table>
              <Alerta alert={alert} handleClose={toggleAlert} />
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        onClick={header.column.getToggleSortingHandler()}
                        key={header.id}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {
                          { asc: "⬆️", desc: "⬇️" }[
                            header.column.getIsSorted() ?? null
                          ]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>

              <TableBody>
                {table.getRowModel()?.rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button onClick={() => handleOpen(row.original)}>
                        <Edit />
                      </Button>
                      <Button onClick={() => handleDelete(row.original)}>
                        <Delete />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* <Button disabled={page == 1} onClick={() => table.setPageIndex(0)}>
            <KeyboardDoubleArrowLeftIcon />
          </Button> */}
          <Button disabled onClick={() => handlePrevPage()}>
            Prev <KeyboardArrowLeftIcon />
          </Button>
          <Button disabled onClick={() => handleNextPage()}>
            Next <KeyboardArrowRightIcon />
          </Button>
          {/* <Button onClick={() =>
             table.setPageIndex(table.getPageCount() - 1)}>
            <KeyboardDoubleArrowRightIcon />
          </Button> */}
        </>
      ) : (
        <div>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    className={style.desb}
                    onClick={header.column.getToggleSortingHandler()}
                    key={header.id}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {
                      { asc: "⬆️", desc: "⬇️" }[
                        header.column.getIsSorted() ?? null
                      ]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          {isLoading && <p style={{ textAlign: "center" }}>Loading...</p>}
        </div>
        // <p>{data.length == 0 ? "" : ""}</p>
      )}
      {showModal && selected ? (
        <ModalEditar data={selected} handleClose={handleClose} />
      ) : null}
    </div>
  );
}
