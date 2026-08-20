import { Outlet } from "react-router";
import AdminNav from './AdminNav'

function AdminLayout() {
    return (
        <main className="min-h-screen w-full flex">
            <section className="absolute content-start md:static max-md:w-full max-md:h-full max-md:bg-[#111629]/0 bg-[#111629] md:p-5 z-999">
                <AdminNav />
            </section>

            <section className="flex-1 bg-white p-5">
                <Outlet />
            </section>
        </main>
    );
}

export default AdminLayout;