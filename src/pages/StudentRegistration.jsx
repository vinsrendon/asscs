import { NavLink } from 'react-router'
import { useState } from 'react'
import arrow from '../assets/arrow-right-stroke.svg'
import scan from '../assets/scan.svg'
import hat from '../assets/hat.svg'
import sheet from '../assets/sheet.webp'
import Swal from 'sweetalert2'
import axios from '../../axios-config.js'

function StudentRegistration(){
    const [firstname, setFirstname] = useState('')
    const [middlename, setMiddlename] = useState('')
    const [lastname, setLastname] = useState('')
    const [course, setCourse] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const clearForm = () =>{
        setFirstname('')
        setMiddlename('')
        setLastname('')
        setCourse('')
        setPhone('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
    }

    const registerStudent = async (e) =>{
        e.preventDefault()

        setLoading(true)

        if(password != confirmPassword){
            Swal.fire({
                text:"Password Doesn't match",
                icon:"warning"
            })
            return
        }

        await axios.post(
            '/register',
            {
                firstname: firstname,
                middlename: middlename,
                lastname: lastname,
                course: course,
                role: 'STUDENT',
                phone: phone,
                email: email,
                password: password,
                status : 'PENDING'
            }
        ).then((res)=>{        
            if(res.status === 200){             
                Swal.fire({
                text:res.data.message,
                icon:"success"
                })
            }
            else{
                Swal.fire({
                text:res.data.message,
                icon:"info"
                })
            }
            clearForm()
        }).catch((err)=>{
            console.log(err)
            clearForm()
            switch (err.status) {
                case 403:
                    Swal.fire({
                        text:err.response.data.message,
                        icon:"warning"
                    })
                return

                case 404:
                    Swal.fire({
                        text:err.response.data.message,
                        icon:"warning"
                    })
                return

                case 500:
                    Swal.fire({
                        text:err.response.data.message,
                        icon:"error"
                    })
                return

                default:
                    Swal.fire({
                        text:"UNEXPECTED ERROR OCCURED CHECK CONSOLE FOR MORE INFO",
                        icon:"error"
                    })
                return
            }
        }).finally(()=>{
            setLoading(false)
        })
    }

    return(        
        <main className="min-h-screen w-full flex">     
            <section className="w-full lg:w-120 flex flex-col justify-center px-8 sm:px-16 bg-background relative z-10 overflow-y-auto py-10">
                <div className="w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-3 mb-5">
                        <div className='bg-primary p-3 rounded-4xl shadow-lg shadow-primary/30'>
                            <img src={scan} alt="scan icon" />
                        </div>   
                        <div>
                            <h1 className='font-bold text-2xl text-foreground leading-none'>AutoCheck</h1>
                            <p className='text-sm font-semibold text-primary'>Academic System</p>
                        </div>     
                    </div>
                    <div>
                        <div className='mb-2'>
                            <NavLink to="/register" className="w-fit flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <img src={arrow} alt="" className="invert opacity-70 rotate-180"/>
                                Back
                            </NavLink>
                        </div>
                        <div className="mb-2">
                            <div className='flex items-center gap-2 mb-1'>
                                <img src={hat} alt="hat icon"/>
                                <span className='text-xs font-semibold uppercase tracking-widest text-primary'>APPLICANT REGISTRATION</span>
                            </div>
                            <h2 className='text-2xl font-bold text-foreground'>Create your account</h2>
                            <p className='text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2'>Your account will require admin approval before you can log in.</p>
                        </div>                        
                        <form className="space-y-1" onSubmit={registerStudent}>
                            <div className="grid grid-cols-2 gap-3">
                                <div className='space-y-1.5'>
                                    <label className="text-sm font-semibold text-foreground">First Name</label>
                                    <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Juan" type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)}></input>
                                </div>
                                <div className='space-y-1.5'>
                                    <label className="text-sm font-semibold text-foreground">
                                        Middle Name 
                                        <span className='text-muted-foreground font-normal'> (Optional)</span>
                                    </label>
                                    <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Santos" type="text" value={middlename} onChange={(e) => setMiddlename(e.target.value)}></input>
                                </div>                                
                            </div>
                            <div className='space-y-1.5'>
                                <label className="text-sm font-semibold text-foreground">Last Name</label>
                                <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Dela Cruz" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)}></input>                                
                            </div>
                            <div className='space-y-1.5'>
                                <label className="text-sm font-semibold text-foreground">Course</label>
                                <select required name="course" id="course" className='w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm' value={course} onChange={(e) => setCourse(e.target.value)}>
                                    <option value="">--Select Your Course--</option>
                                    <option value="BSED">BSED</option>
                                    <option value="BSEE">BSEE</option>
                                    <option value="BSHM">BSHM</option>
                                    <option value="BSIT">BSIT</option>
                                </select>
                            </div>
                            <div className='space-y-1.5'>
                                <label className="text-sm font-semibold text-foreground">Phone Number</label>
                                <input required minLength='11' maxLength='11' className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="09123456789" type="numeric" pattern="[0-9]*"  value={phone} onChange={(e) => setPhone(e.target.value)}></input>
                            </div>
                            <div className='space-y-1.5'>
                                <label className="text-sm font-semibold text-foreground">Email Address</label>
                                <input required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="you@school.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)}></input>
                            </div>
                            <div className='space-y-1.5'>
                                <label className="text-sm font-semibold text-foreground">Password</label>
                                <input required minLength="6" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Min. 6 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                            </div>
                            <div className='space-y-1.5'>
                                <label className="text-sm font-semibold text-foreground">Confirm Password</label>
                                <input required minLength="6" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="Min. 6 characters" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></input>
                            </div>
                            <button disabled={loading} className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 mt-2 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200" type="submit">
                            {loading ? 'Registering...' : 'Submit Registration'} <img src={arrow} alt="right arrow" />
                            </button>
                        </form>
                        <p className='mt-2 text-center text-sm text-muted-foreground'>
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

export default StudentRegistration