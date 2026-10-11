"use client";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Application, STATUSES, Status } from "@/lib/types";

const COLORS: Record<Status, string> = {
  applied: "bg-blue-100", interview: "bg-yellow-100", offer: "bg-green-100", rejected: "bg-red-100",
};

export default function BoardPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ company: "", role: "", notes: "" });

  const { data: apps = [] } = useQuery<Application[]>({
    queryKey: ["apps", search],
    queryFn: async () => (await api.get("/applications/", { params: { search } })).data.results,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["apps"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
  };

  const add = useMutation({
    mutationFn: () => api.post("/applications/", form),
    onSuccess: () => { setForm({ company: "", role: "", notes: "" }); refresh(); },
  });
  const move = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) =>
      api.patch(`/applications/${id}/`, { status }),
    onMutate: ({ id, status }) => {
      qc.setQueriesData<Application[]>({ queryKey: ["apps"] }, (old) =>
        old?.map((a) => (a.id === id ? { ...a, status } : a)));
    },
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/applications/${id}/`),
    onSuccess: refresh,
  });

  const onDragEnd = (r: DropResult) => {
    if (!r.destination || r.destination.droppableId === r.source.droppableId) return;
    move.mutate({ id: Number(r.draggableId), status: r.destination.droppableId as Status });
  };

  const input = "rounded border border-gray-300 bg-white p-2";
  return (
    <div>
      <form className="mb-4 flex flex-wrap gap-2"
        onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
        <input className={input} placeholder="Company" value={form.company} required
          onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input className={input} placeholder="Role" value={form.role} required
          onChange={(e) => setForm({ ...form, role: e.target.value })} />
        <input className={input} placeholder="Notes" value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="rounded bg-blue-600 px-4 text-white">Add</button>
        <input className={`${input} ml-auto`} placeholder="Search..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className={`min-h-64 rounded-lg p-3 ${COLORS[status]}`}>
                  <h2 className="mb-2 font-semibold capitalize">
                    {status} ({apps.filter((a) => a.status === status).length})
                  </h2>
                  {apps.filter((a) => a.status === status).map((a, index) => (
                    <Draggable key={a.id} draggableId={String(a.id)} index={index}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                          className="mb-2 rounded bg-white p-3 shadow">
                          <div className="font-medium">{a.role}</div>
                          <div className="text-sm text-gray-600">{a.company}</div>
                          {a.notes && <div className="mt-1 text-xs text-gray-500">{a.notes}</div>}
                          <button className="mt-2 text-xs text-red-600"
                            onClick={() => remove.mutate(a.id)}>Delete</button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}