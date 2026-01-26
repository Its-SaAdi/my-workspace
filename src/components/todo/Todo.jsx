import { useEffect, useState } from "react";

const Todo = () => {
    const [todos, setTodos] = useState([]);
    const [todoInput, setTodoInput] = useState("");
    const [todoFilter, setTodoFilter] = useState("all");

    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const [undoData, setUndoData] = useState(null);

    useEffect(() => {
        const storedTodos = JSON.parse(localStorage.getItem("workspace.todos")) || [];
        setTodos(storedTodos);
    }, [])

    useEffect(() => {
        if (todos.length === 0) return;
        localStorage.setItem("workspace.todos", JSON.stringify(todos));
    }, [todos]);

    const addTodo = () => {
        if (todoInput.trim() === "") return;

        let newTodo = {
            id: Date.now(),
            text: todoInput.trim(),
            completed: false,
        }

        setTodos(prev => [...prev, newTodo]);
        setTodoInput("");
    }

    const handleTodoKeys = (e) => {
        if (e.key === "Enter" && e.ctrlKey) {
            addTodo();
            // e.preventDefault();
            return;
        }
    }

    const toggleTodo = (id) => {
        if (editingId) return;

        setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    }

    const deleteTodo = (id, event) => {
        event.stopPropagation();

        if (undoData) {
            clearTimeout(undoData.timeoutId);
            setUndoData(null);
        }

        let index = todos.findIndex(todo => todo.id === id);
        let deleteTodo = todos[index];

        setTodos(prev => prev.filter(todo => todo.id !== id));

        const timeoutId = setTimeout(() => {
            setUndoData(null);
        }, 5000);

        setUndoData({
            todo: deleteTodo,
            index,
            timeoutId,
        })
    }

    const undoDelete = () => {
        if (!undoData) return;

        clearTimeout(undoData.timeoutId);

        setTodos(prev => {
            const copy = [...prev];
            copy.splice(undoData.index, 0, undoData.todo);
            return copy;
        });

        setUndoData(null);
    }

    const startEditing = (todo) => {
        setEditingId(todo.id);
        setEditingText(todo.text);
    }

    const saveEdit = (todoId) => {
        setTodos(prev =>
            prev.map(todo =>
                todo.id === todoId ? { ...todo, text: editingText.trim() || todo.text } : todo
            )
        )

        setEditingId(null);
        setEditingText("");
    }

    const handleEditKeys = (e, id) => {
        if (e.key === "Escape") {
            setEditingId(null);
            setEditingText("");
            return;
        }

        if (e.key === "Enter") {
            // Ctrl + Enter → insert newline
            if (e.ctrlKey) {
                e.preventDefault();

                const textarea = e.target;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;

                setEditingText(prev =>
                    prev.slice(0, start) + "\n" + prev.slice(end)
                );

                // restore cursor position
                requestAnimationFrame(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                });

                return;
            }

            // Enter only → save
            e.preventDefault();
            saveEdit(id);
        }
    };

    const filteredTodos = todos.filter(todo => {
        if (todoFilter === "active") return !todo.completed;
        if (todoFilter === "completed") return todo.completed;
        return true;
    })

    const renderTodos = () => {
        const list = [...filteredTodos];

        if (undoData) {
            list.splice(undoData.index, 0, { __undo: true });
        }

        return list;
    };

    return (
        <div className="w-full h-full flex flex-col text-white">

            {/* New Task Input */}
            <div className="mb-4">
                <textarea
                    placeholder="Add a new task..."
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg outline-none resize-none focus:bg-white/10"
                    rows={2}
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    onKeyDown={(e) => handleTodoKeys(e)}
                />
                <button
                    className="mt-2 bg-white/10 hover:bg-white/20 rounded-lg py-2 px-3 text-sm text-white font-semibold transition-all duration-200 cursor-pointer"
                    onClick={addTodo}
                >
                    Add
                </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 mb-4">
                <button
                    className={`rounded-lg py-1 px-3 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10 ${todoFilter === "all" ? "bg-white/20 scale-105 " : "active:scale-95 hover:bg-white/10"}`}
                    onClick={() => setTodoFilter("all")}
                >
                    All
                </button>

                <button
                    className={`rounded-lg py-1 px-3 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10 ${todoFilter === "active" ? "bg-white/20 scale-105 " : "active:scale-95 hover:bg-white/10"}`}
                    onClick={() => setTodoFilter("active")}
                >
                    Active
                </button>

                <button
                    className={`rounded-lg py-1 px-3 text-white font-semibold transition-all duration-200 cursor-pointer hover:bg-white/10 ${todoFilter === "completed" ? "bg-white/20 scale-105 " : "active:scale-95 hover:bg-white/10"}`}
                    onClick={() => setTodoFilter("completed")}
                >
                    Completed
                </button>
            </div>

            {/* Todo Items Container */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                {filteredTodos.length === 0 ? (
                    <p className="text-white/40 italic">No todos yet.</p>
                ) : renderTodos().map((todo, index) => {
                    if (todo.__undo) {
                        return (
                            <div
                                key="undo"
                                className="relative rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 flex items-center justify-between animate-pulse"
                            >
                                <div className="flex items-center gap-2 text-yellow-300 text-sm font-medium">
                                    <span>Todo deleted</span>
                                    <span className="text-xs text-yellow-300/60">(5s)</span>
                                </div>

                                <button
                                    onClick={undoDelete}
                                    className="text-yellow-200 font-semibold hover:underline"
                                >
                                    Undo
                                </button>
                            </div>
                        );
                    } else {
                        return (
                            <div
                                key={todo.id}
                                className="group bg-white/5 border border-white/10 rounded-lg p-3 relative hover:bg-white/10 transition"
                                onClick={() => toggleTodo(todo.id)}
                                onDoubleClick={() => startEditing(todo)}
                            >
                                {editingId === todo.id ? (
                                    <textarea
                                        className="w-full bg-white/10 border border-white/20 rounded-md p-2 text-sm resize-none outline-none"
                                        value={editingText}
                                        autoFocus
                                        rows={Math.max(2, editingText.split("\n").length)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        onKeyDown={(e) => handleEditKeys(e, todo.id)}
                                        onBlur={() => saveEdit(todo.id)}
                                    />
                                ) : (
                                    <p className={`whitespace-pre-wrap text-sm font-semibold ${todo.completed === true ? "line-through opacity-50" : ""}`}>
                                        {todo.text}
                                    </p>
                                )}

                                {editingId !== todo.id && (
                                    <button
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 transition -pointer"
                                        onClick={(e) => deleteTodo(todo.id, e)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2-icon lucide-trash-2 text-white/60 hover:text-red-500 transition"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    </button>
                                )}
                            </div>
                        )
                    }
                })}

            </div>
        </div>
    );
};

export default Todo;