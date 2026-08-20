import { Outlet } from "react-router";
import AdminNav from './AdminNav'

function AdminLayout() {
    return (
        <main className="min-h-screen md:flex">
            <section className="md:static max-md:w-full inset-0 max-md:bg-[#111629]/90 bg-[#111629] md:p-5">
                <AdminNav />
            </section>

            <section className="flex-1 bg-white p-5">
                <Outlet />
            </section>
        </main>
    );
}

export default AdminLayout;