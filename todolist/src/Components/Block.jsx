import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDocs, deleteDoc, setDoc, query, orderBy } from 'firebase/firestore';
import Task from './Task.jsx';
import { Modal, Button } from 'react-bootstrap';

const Block = ({ block, updateBlock, deleteBlock }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskExpReward, setNewTaskExpReward] = useState('');
    const [show, setShow] = useState(false);
    const db = getFirestore();

    useEffect(() => {
        //order task based on due date
        const fetchTasks = async () => {
            const tasksSnapshot = await getDocs(query(collection(db, 'Users', 'userId', 'Pages', 'pageId', 'Blocks', block.id, 'Tasks'), orderBy('dueDate')));
            setTasks(tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchTasks();
    }, [block.id, db]);

    const addTask = async () => {
        const newTaskRef = doc(collection(db, 'Users', 'userId', 'Pages', 'pageId', 'Blocks', block.id, 'Tasks'));
        const newTask = {
            name: newTaskName,
            category: newTaskCategory,
            creationTime: new Date(),
            dueDate: newTaskDueDate,
            expReward: newTaskExpReward,
            completed: false
        };
        await setDoc(newTaskRef, newTask);
        setTasks([...tasks, { id: newTaskRef.id, ...newTask }]);
        setNewTaskName('');
        setNewTaskCategory('');
        setNewTaskDueDate('');
        setShow(false);
    };

    const updateTask = async (taskId, updatedTask) => {
        const taskRef = doc(db, 'Users', 'userId', 'Pages', 'pageId', 'Blocks', block.id, 'Tasks', taskId);
        await setDoc(taskRef, updatedTask, { merge: true });
        setTasks(tasks.map(task => task.id === taskId ? { ...task, ...updatedTask } : task));
    };

    const deleteTask = async (taskId) => {
        await deleteDoc(doc(db, 'Users', 'userId', 'Pages', 'pageId', 'Blocks', block.id, 'Tasks', taskId));
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const handleBlockHeadingChange = (e) => {
        updateBlock(block.id, { heading: e.target.value });
    };

    const handleBlockColorChange = (e) => {
        updateBlock(block.id, { color: e.target.value });
    };

    //outlines the border based on color selected
    const blockStyle = {
        border: `2px solid ${block.color}`, 
    };

    return (
        //Container of a block
        <div className="block border rounded" style={{blockStyle}}>

            {/* div of block heading and color, with button to delete block */}
            <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: block.color}}>
                <input 
                    className="form-control me-2"
                    type="text" 
                    value={block.heading} 
                    onChange={handleBlockHeadingChange}
                    placeholder='Block has no name' 
                    style = {{fontWeight: 'bold'}}
                />
                <input 
                    className="form-control form-control-color me-4"
                    type="color" 
                    value={block.color} 
                    onChange={handleBlockColorChange} 
                />
                {/* Add task form */}
                <div className="">
                    <Button className="btn btn-primary btn-sm" style={{ fontSize: '1rem' }} onClick={() => setShow(true)}>
                        Add Task
                    </Button>

                    <Modal show={show} onHide={() => setShow(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add New Task</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <input 
                                type="text" 
                                className="form-control mb-2"
                                placeholder="Set Task name" 
                                value={newTaskName} 
                                onChange={(e) => setNewTaskName(e.target.value)} 
                            />
                            <input 
                                type="text" 
                                className="form-control mb-2" 
                                placeholder="Set Task Category" 
                                value={newTaskCategory} 
                                onChange={(e) => setNewTaskCategory(e.target.value)} 
                            />
                            <input 
                                type="date" 
                                className="form-control mb-2"
                                value={newTaskDueDate} 
                                onChange={(e) => setNewTaskDueDate(e.target.value)} 
                            />
                            <input 
                                type="number" 
                                className="form-control mb-2"
                                placeholder="Set Task EXP" 
                                value={newTaskExpReward} 
                                onChange={(e) => setNewTaskExpReward(e.target.value)} 
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                            <Button variant="primary" onClick={addTask}>Add Task</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <button onClick={() => deleteBlock(block.id)} className="btn btn-danger btn-sm ms-4">
                    <i class="bi bi-clipboard-x me-1" ></i>
                    <span style={{ fontSize: '1rem' }}>Delete Block</span>
                </button>
            </div>

            {/* Container with tasks, and add tasks form */}
            <div className="tasks">
                {tasks.map(task => (
                    <Task 
                        key={task.id} 
                        task={task} 
                        onDelete={() => deleteTask(task.id)} 
                        onUpdate={(updatedTask) => updateTask(task.id, updatedTask)} 
                    />
                ))}

                
            </div>
        </div>
    );
};

export default Block;
