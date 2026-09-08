import  { Link, useParams } from "react-router-dom"

function FutureRoom() {
    return (
        <main className="future-room">
            <Link to="/pending-tasks">🔙 Back to tasks</Link>
        </main>
    )
}

export default FutureRoom;