import { Outlet } from "react-router";
import TeacherNav from './TeacherNav'

function TeacherLayout() {
    return (
        <main className="min-h-screen md:flex">
            <section className="md:static max-md:w-full inset-0 max-md:bg-[#111629]/90 bg-[#111629] md:p-5">
                <TeacherNav />
            </section>

            <section className="flex-1 bg-white p-5">
                <Outlet />
            </section>
        </main>
    );
}

export default TeacherLayout;