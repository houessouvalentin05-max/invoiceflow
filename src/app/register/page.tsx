'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type RegisterInput = z.infer<typeof registerSchema>

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // Email en attente de confirmation : non-null ⇒ écran « vérifiez votre boîte mail ».
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        // Le lien de confirmation doit revenir sur /auth/callback, seule route
        // qui sait échanger le `?code=` PKCE contre une session. Sans ça
        // Supabase renvoie sur la racine du site (site_url) où le code est perdu.
        // Les URLs de retour sont allow-listées côté Supabase (Redirect URLs).
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Autoconfirm activé côté Supabase ⇒ session immédiate, on entre direct.
    if (signUpData.session) {
      router.push('/dashboard')
      return
    }

    // Confirmation par email requise (cas de ce projet) : aucune session
    // n'existe encore, donc /dashboard redirigerait vers /login. On affiche
    // l'étape suivante à la place.
    setLoading(false)
    setPendingEmail(signUpData.user?.email ?? data.email)
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',fontFamily:'Inter,system-ui,sans-serif',background:'#F8FAFC'}}>

      {/* LEFT — Branding */}
      <div style={{
        width:'45%',background:'#111827',display:'flex',flexDirection:'column',
        justifyContent:'space-between',padding:'48px',position:'relative',overflow:'hidden',
        flexShrink:0
      }}>
        {/* Glow */}
        <div style={{position:'absolute',top:-120,left:-120,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,99,235,0.35) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-80,right:-80,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.3) 0%,transparent 70%)',pointerEvents:'none'}}/>

        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:12,position:'relative',zIndex:1}}>
          <div style={{
            width:40,height:40,borderRadius:12,
            background:'linear-gradient(135deg,#2563EB,#7C3AED)',
            display:'grid',placeItems:'center',flexShrink:0
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
              <path d="M6 5v14"/><path d="M11 19V5h7"/><path d="M11 12h5"/>
            </svg>
          </div>
          <span style={{fontWeight:800,fontSize:18,color:'#fff',letterSpacing:'-0.3px'}}>
            Invoice<span style={{background:'linear-gradient(90deg,#60A5FA,#A78BFA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Flow</span>
          </span>
        </div>

        {/* Center content */}
        <div style={{position:'relative',zIndex:1}}>
          <h2 style={{fontSize:32,fontWeight:800,color:'#fff',letterSpacing:'-0.8px',lineHeight:1.2,margin:'0 0 16px'}}>
            La facturation pensée pour l&apos;Afrique
          </h2>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.55)',lineHeight:1.7,margin:'0 0 40px'}}>
            Créez des factures professionnelles, acceptez MTN MoMo & Orange Money, et suivez vos paiements en temps réel.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {['Paiements Mobile Money intégrés','Facturation en XOF, CFA','Dashboard analytique temps réel'].map(f => (
              <div key={f} style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.4)',display:'grid',placeItems:'center',flexShrink:0}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:11,height:11}}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{fontSize:13.5,color:'rgba(255,255,255,0.7)',fontWeight:500}}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{fontSize:12,color:'rgba(255,255,255,0.25)',position:'relative',zIndex:1}}>
          © 2026 InvoiceFlow · VOID STUDIO
        </p>
      </div>

      {/* RIGHT — Form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 32px'}}>
        <div style={{width:'100%',maxWidth:420}}>
          {pendingEmail ? (
            /* ── Écran 2 : confirmation email requise ───────────────────────
               Distinct de l'écran d'erreur (message rouge) : ici tout s'est
               bien passé, il reste une action côté utilisateur. */
            <div role="status" aria-live="polite">
              <div style={{width:56,height:56,borderRadius:16,background:'rgba(37,99,235,0.08)',border:'1px solid rgba(37,99,235,0.2)',display:'grid',placeItems:'center',marginBottom:20}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
                  <rect x="3" y="5" width="18" height="14" rx="2.5"/>
                  <path d="M3.5 7.5l8.5 6 8.5-6"/>
                </svg>
              </div>

              <h1 style={{fontSize:26,fontWeight:800,color:'#0F172A',letterSpacing:'-0.6px',margin:'0 0 10px'}}>
                Vérifiez votre boîte mail
              </h1>
              <p style={{fontSize:14,color:'#64748B',lineHeight:1.7,margin:'0 0 22px'}}>
                Votre compte est créé. Nous avons envoyé un lien de confirmation à{' '}
                <strong style={{color:'#0F172A',fontWeight:600}}>{pendingEmail}</strong>.
              </p>

              <ol style={{margin:'0 0 22px',padding:'0 0 0 20px',display:'flex',flexDirection:'column',gap:8}}>
                {[
                  'Ouvrez l’email de confirmation (pensez à vérifier les spams).',
                  'Cliquez sur le lien de confirmation reçu.',
                  'Vous arriverez directement sur votre tableau de bord.',
                ].map(step => (
                  <li key={step} style={{fontSize:13.5,color:'#334155',lineHeight:1.6}}>{step}</li>
                ))}
              </ol>

              <div style={{background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:12,padding:'12px 14px',fontSize:13,color:'#64748B',lineHeight:1.6,marginBottom:26}}>
                L’email peut mettre une à deux minutes à arriver. Le lien expire au bout d’un moment : ouvrez-le rapidement.
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <a href="/login" style={{height:44,display:'grid',placeItems:'center',background:'linear-gradient(135deg,#2563EB 0%,#4F46E5 50%,#7C3AED 100%)',color:'#fff',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none',boxShadow:'0 4px 14px -4px rgba(79,70,229,0.5)'}}>
                  J’ai confirmé, me connecter
                </a>
                <button
                  type="button"
                  onClick={() => { reset(); setPendingEmail(null) }}
                  style={{height:44,background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:10,fontSize:14,fontWeight:600,color:'#0F172A',cursor:'pointer',fontFamily:'inherit'}}
                >
                  Utiliser une autre adresse email
                </button>
              </div>
            </div>
          ) : (
          <>
          <h1 style={{fontSize:26,fontWeight:800,color:'#0F172A',letterSpacing:'-0.6px',margin:'0 0 6px'}}>
            Créer un compte
          </h1>
          <p style={{fontSize:14,color:'#64748B',margin:'0 0 32px'}}>
            Déjà un compte ?{' '}
            <a href="/login" style={{color:'#2563EB',fontWeight:600,textDecoration:'none'}}>Se connecter</a>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{display:'flex',flexDirection:'column',gap:20}}>

            {/* Email */}
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="vous@example.com"
                style={{
                  width:'100%',height:44,border:`1px solid ${errors.email?'#FCA5A5':'#E2E8F0'}`,
                  borderRadius:10,padding:'0 14px',fontSize:14,color:'#0F172A',
                  background:'#F8FAFC',outline:'none',fontFamily:'inherit',boxSizing:'border-box',
                  transition:'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor='#2563EB'}
                onBlur={e => e.target.style.borderColor=errors.email?'#FCA5A5':'#E2E8F0'}
              />
              {errors.email && <p style={{fontSize:12,color:'#DC2626',margin:'4px 0 0'}}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Mot de passe</label>
              <div style={{position:'relative'}}>
                <input
                  {...register('password')}
                  type={showPassword?'text':'password'}
                  placeholder="••••••••"
                  style={{
                    width:'100%',height:44,border:`1px solid ${errors.password?'#FCA5A5':'#E2E8F0'}`,
                    borderRadius:10,padding:'0 44px 0 14px',fontSize:14,color:'#0F172A',
                    background:'#F8FAFC',outline:'none',fontFamily:'inherit',boxSizing:'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor='#2563EB'}
                  onBlur={e => e.target.style.borderColor=errors.password?'#FCA5A5':'#E2E8F0'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',cursor:'pointer',color:'#94A3B8',padding:0,display:'grid',placeItems:'center'
                }}>
                  {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                </button>
              </div>
              {errors.password && <p style={{fontSize:12,color:'#DC2626',margin:'4px 0 0'}}>{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Confirmer le mot de passe</label>
              <div style={{position:'relative'}}>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword?'text':'password'}
                  placeholder="••••••••"
                  style={{
                    width:'100%',height:44,border:`1px solid ${errors.confirmPassword?'#FCA5A5':'#E2E8F0'}`,
                    borderRadius:10,padding:'0 44px 0 14px',fontSize:14,color:'#0F172A',
                    background:'#F8FAFC',outline:'none',fontFamily:'inherit',boxSizing:'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor='#2563EB'}
                  onBlur={e => e.target.style.borderColor=errors.confirmPassword?'#FCA5A5':'#E2E8F0'}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{
                  position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',cursor:'pointer',color:'#94A3B8',padding:0,display:'grid',placeItems:'center'
                }}>
                  {showConfirmPassword ? <EyeOffIcon/> : <EyeIcon/>}
                </button>
              </div>
              {errors.confirmPassword && <p style={{fontSize:12,color:'#DC2626',margin:'4px 0 0'}}>{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div role="alert" style={{background:'#FEF2F2',border:'1px solid #FCA5A5',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#DC2626'}}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                height:44,background:'linear-gradient(135deg,#2563EB 0%,#4F46E5 50%,#7C3AED 100%)',
                color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:600,
                cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,
                fontFamily:'inherit',transition:'all 0.2s',
                boxShadow:'0 4px 14px -4px rgba(79,70,229,0.5)'
              }}
            >
              {loading ? 'Inscription...' : "S'inscrire →"}
            </button>
          </form>

          <p style={{fontSize:12,color:'#94A3B8',textAlign:'center',marginTop:32}}>
            En vous inscrivant, vous acceptez nos{' '}
            <a href="#" style={{color:'#2563EB',textDecoration:'none'}}>conditions d&apos;utilisation</a>
          </p>
          </>
          )}
        </div>
      </div>
    </main>
  )
}