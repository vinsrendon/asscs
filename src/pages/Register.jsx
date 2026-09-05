import { NavLink } from 'react-router'
import hat from '../assets/hat.svg'
import user from '../assets/user.svg'
import scan from '../assets/scan.svg'
import sheet from '../assets/sheet.webp'

function Register(){
    return(
        <main className="min-h-screen w-full flex">            
            <section className="w-full lg:w-120 flex flex-col justify-center px-8 sm:px-16 bg-background relative z-10 overflow-y-auto py-10">
                <div className="w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-3 mb-10">
                        <div className='bg-primary p-3 rounded-4xl shadow-lg shadow-primary/30'>
                            <img src={scan} alt="scan icon" />
                        </div>   
                        <div>
                            <h1 className='font-bold text-2xl text-foreground leading-none'>AutoCheck</h1>
                            <p className='text-sm font-semibold text-primary'>Academic System</p>
                        </div>     
                    </div>
                    <div>
                        <div className="mb-7">
                            <h2 className="text-3xl font-bold text-foreground mb-1">Create account</h2>
                            <p className="text-muted-foreground text-sm">Who are you registering as?</p>
                        </div>
                        <div className="space-y-3">
                            <NavLink to="/teacherregistration" className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-200">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                                    <img src={user} alt="user icon" className='text-blue-500'/>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-foreground">Teacher</p>
                                    <p className="text-xs text-muted-foreground">Manage exams, scan sheets, and view results</p>
                                </div>
                            </NavLink>                           
                            
                            <NavLink to="/studdentregistration" className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-200">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                                    <img src={hat} alt="scan icon" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-foreground">Student</p>
                                    <p className="text-xs text-muted-foreground">Register for student to view your exam scores</p>
                                </div>
                            </NavLink>

                            <NavLink to="/applicantregistration" className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-200">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                                    <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" >
                                    <path className="fill-orange-500" d="M21 8c-.2 0-4.85.03-9 2.01C7.85 8.03 3.2 8 3 8c-.55 0-1 .45-1 1v9.88c0 .27.11.53.31.72.19.19.45.3.73.28.04 0 3.97-.11 8.54 2.02.02 0 .03 0 .05.01.12.05.24.08.37.08s.25-.03.37-.08c.02 0 .03 0 .05-.01 4.54-2.12 8.51-2.03 8.54-2.02.27.02.53-.09.73-.28.19-.19.31-.45.31-.72V9c0-.55-.45-1-1-1M4 10.05c1.49.11 4.38.48 7 1.69v7.74c-3.02-1.18-5.62-1.5-7-1.58v-7.86Zm16 7.86c-1.38.08-3.98.4-7 1.58v-7.74c2.62-1.21 5.51-1.58 7-1.69v7.86ZM12 2a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path>
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-foreground">Applicant</p>
                                    <p className="text-xs text-muted-foreground">Register for applicant to view your entrance exam scores</p>
                                </div>
                            </NavLink>
                        </div>
                        <p className='mt-7 text-center text-sm text-muted-foreground'>
                            Already have an account?
                            <NavLink to="/" className='font-semibold text-primary hover:underline'> Sign In</NavLink>
                        </p>
                    </div>
                </div>          
            </section>
            <section className="hidden lg:block relative flex-1 bg-slate-900 overflow-hidden">                       
                <div className="absolute inset-0 bg-linear-to-tr from-primary/80 to-transparent mix-blend-multiply z-10"></div>    
                <img className='absolute inset-0 w-full h-full object-cover opacity-80' src={sheet}/>        
                                    
                <div className='absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center text-white'>
                    <div className='bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-3xl max-w-lg'>
                        <h3 className='text-3xl font-bold mb-4'>Automate your entrance exam workflow</h3>
                        <p className='text-slate-300 text-lg leading-relaxed'>Instantly scan, grade, and analyze multiple-choice answer sheets with our AI-powered system. Save hours of manual checking.</p>
                    </div>
                </div> 
            </section>
        </main>
    )
}

export default Register