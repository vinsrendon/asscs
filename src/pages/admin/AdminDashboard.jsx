import AdminNav from './AdminNav'

function AdminDashboard(){    
    return(
        <main className="min-h-screen w-full flex">            
            <section className="absolute content-start md:static max-md:w-20 max-md:bg-[#111629]/0 bg-[#111629] p-5 z-999">
                <AdminNav/>
            </section>
            <section className="flex-1 bg-white p-5">  
                
            </section>
        </main>
    )
}

export default AdminDashboard