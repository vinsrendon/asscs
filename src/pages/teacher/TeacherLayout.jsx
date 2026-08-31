import { Outlet } from "react-router";
import TeacherNav from './TeacherNav'

function TeacherLayout() {
    return (
        <main className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
            <section className="md:h-full overflow-y-auto shrink-0 z-40 bg-[#111629]">
                <TeacherNav />
            </section>

            <section className="flex-1 h-full overflow-y-auto p-5">
                <Outlet />
            </section>
        </main>
    );
}

export default TeacherLayout;