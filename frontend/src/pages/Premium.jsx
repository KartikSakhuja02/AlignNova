import React, { useState } from 'react';

const PLANS = [
  {
    name: 'Free Starter',
    priceMonthly: 0,
    priceYearly: 0,
    desc: 'Core dashboard access to find and apply for standard campus drives.',
    features: [
      'Access to standard campus placement drives',
      'Basic student dashboard & application tracking',
      'Standard resume parsing',
      'Email support (3-5 day response time)',
    ],
    cta: 'Current Plan',
    active: false,
    recommended: false,
    color: 'border-slate-200',
  },
  {
    name: 'Alignnova Pro',
    priceMonthly: 29,
    priceYearly: 279,
    desc: 'Accelerate your career search with professional tools and priority application matching.',
    features: [
      'Priority application matching (3x higher visibility)',
      'Unlimited mock interviews with AI feedback',
      'Professional ATS Resume Optimizer tool',
      'Exclusive premium drives & off-campus internships',
      'Priority Discord support channel (under 4h response)',
    ],
    cta: 'Upgrade to Pro',
    active: true,
    recommended: true,
    color: 'border-primary shadow-lg relative',
  },
  {
    name: 'Elite Cohort',
    priceMonthly: 99,
    priceYearly: 950,
    desc: 'For students seeking direct mentorship and guaranteed interview loops with Top Tier tech & finance firms.',
    features: [
      'Everything in Pro plan included',
      '1-on-1 monthly mentorship with Senior Engineers',
      'Guaranteed referral pipeline to 5+ partner firms',
      'Custom portfolio and github reviews',
      '24/7 dedicated Slack channel assistance',
    ],
    cta: 'Join Elite Cohort',
    active: false,
    recommended: false,
    color: 'border-slate-200',
  },
];

const FAQS = [
  {
    q: 'How does the priority placement matching work?',
    a: 'Alignnova Pro candidates are highlighted at the top of the recruiter dashboards. When partners search for matching skills (e.g. React, Python), Pro profiles are boosted to the top of the list, increasing visibility by up to 3x.',
  },
  {
    q: 'Can I cancel or downgrade my subscription anytime?',
    a: 'Absolutely. You can manage your subscription easily from the settings page or email us. You will retain all premium privileges until the end of your current billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, debit cards, and popular wallets (Stripe, Google Pay, Apple Pay). All payment information is securely processed using bank-grade encryption.',
  },
  {
    q: 'Is there a student discount or financial aid available?',
    a: 'Yes! We offer up to 50% discount for students from partnering universities or those facing financial difficulties. Please reach out to support@alignnova.com with your student ID.',
  },
];

export default function Premium() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(null); // null | 'form' | 'processing' | 'success'
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Checkout Form State
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: '',
  });

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setCheckoutStep('processing');
    setTimeout(() => {
      setCheckoutStep('success');
    }, 2000);
  };

  const closeCheckout = () => {
    setSelectedPlan(null);
    setCheckoutStep(null);
    setCardForm({ name: '', number: '', expiry: '', cvc: '' });
  };

  return (
    <div
      className="p-p-lg min-h-screen"
      style={{
        background:
          'radial-gradient(at 0% 0%, rgba(79,70,229,0.06) 0px, transparent 55%), radial-gradient(at 100% 100%, rgba(0,108,73,0.04) 0px, transparent 55%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto pb-24 space-y-12">
        {/* Header Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-label-md font-bold uppercase tracking-wider">
            AlignNova Premium
          </span>
          <h2 className="text-headline-lg font-black text-on-surface !text-4xl md:!text-5xl leading-tight">
            Supercharge Your Career Search
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            Get access to premium placement drives, AI mock interviews, and priority recruiter matching to land your dream job faster.
          </p>

          {/* Toggle Switch */}
          <div className="pt-6 flex justify-center items-center gap-4">
            <span className={`text-label-md ${billingCycle === 'monthly' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle((b) => (b === 'monthly' ? 'yearly' : 'monthly'))}
              className="w-14 h-8 bg-surface-container-high rounded-full p-1 transition-all flex items-center relative border border-outline-variant/30 cursor-pointer"
            >
              <div
                className={`w-6 h-6 bg-primary rounded-full shadow-md transition-transform duration-300 ${
                  billingCycle === 'yearly' ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <span className={`text-label-md flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              Yearly
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
          {PLANS.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            const cycleText = billingCycle === 'monthly' ? 'mo' : 'yr';
            const isFree = price === 0;

            return (
              <div
                key={plan.name}
                className={`bg-white border rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-xl hover:scale-[1.01] transition-all duration-300 ${plan.color}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-caption font-bold px-4 py-1 rounded-full shadow-md uppercase tracking-wider">
                    Recommended Plan
                  </div>
                )}
                
                <div>
                  <h3 className="text-headline-md font-bold text-on-surface mb-2">{plan.name}</h3>
                  <p className="text-on-surface-variant text-caption min-h-[40px] mb-6">{plan.desc}</p>
                  
                  {/* Pricing Display */}
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-headline-lg font-black text-on-surface !text-5xl">
                      {isFree ? 'Free' : `$${price}`}
                    </span>
                    {!isFree && (
                      <span className="text-outline text-label-md font-medium">/{cycleText}</span>
                    )}
                  </div>

                  {/* Feature List */}
                  <div className="space-y-4 border-t border-slate-100 pt-6">
                    <p className="text-[12px] font-bold text-outline uppercase tracking-wider">Features Included:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-secondary font-bold text-lg select-none">
                            check_circle
                          </span>
                          <span className="text-body-md text-on-surface-variant leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-8">
                  {isFree ? (
                    <button
                      disabled
                      className="w-full py-4 bg-surface-container-low text-on-surface-variant rounded-2xl font-bold text-label-md text-center opacity-80 cursor-not-allowed"
                    >
                      {plan.cta}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setCheckoutStep('form');
                      }}
                      className={`w-full py-4 rounded-2xl font-bold text-label-md text-center hover:scale-[1.01] transition-transform duration-200 shadow-md ${
                        plan.recommended
                          ? 'bg-primary text-on-primary hover:shadow-lg'
                          : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Section */}
        <section className="bg-white border border-slate-100 rounded-3xl p-p-lg md:p-p-xl shadow-sm space-y-8 mt-10">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <h3 className="text-headline-md font-bold text-on-surface">Compare Access Levels</h3>
            <p className="text-on-surface-variant text-caption">Explore side by side details of what Pro and Elite offer.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 text-outline text-label-md uppercase tracking-wider">
                  <th className="py-4 pr-4">Features</th>
                  <th className="py-4 px-4 text-center">Starter</th>
                  <th className="py-4 px-4 text-center text-primary font-bold">Pro</th>
                  <th className="py-4 px-4 text-center">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body-md text-on-surface-variant">
                {[
                  { title: 'Drive Access Limit', free: 'Standard', pro: 'Unlimited Plus Premium', elite: 'Full Access + Hot Leads' },
                  { title: 'Resume Feedback', free: 'Basic Check', pro: 'AI Powered ATS Audit', elite: 'Expert Human Review' },
                  { title: 'AI Mock Interviews', free: '1 Trial Session', pro: 'Unlimited Access', elite: 'Custom Panel Simulation' },
                  { title: 'Priority Matching Boost', free: 'None', pro: '3x Candidate Boost', elite: 'Top-Rank Referral' },
                  { title: 'Support SLA', free: '3-5 Days', pro: 'Under 4 Hours', elite: '24/7 Dedicated Channel' },
                ].map((row) => (
                  <tr key={row.title} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 pr-4 font-semibold text-on-surface text-label-md">{row.title}</td>
                    <td className="py-4 px-4 text-center text-caption">{row.free}</td>
                    <td className="py-4 px-4 text-center font-semibold text-primary text-caption">{row.pro}</td>
                    <td className="py-4 px-4 text-center text-caption">{row.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="space-y-8 max-w-3xl mx-auto pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-headline-md font-bold text-on-surface">Frequently Asked Questions</h3>
            <p className="text-on-surface-variant text-caption">Have questions about subscription terms? We have answers.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm cursor-pointer hover:border-primary/30 transition-all select-none"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                >
                  <div className="flex justify-between items-center gap-4">
                    <h4 className="font-semibold text-label-md text-on-surface">{faq.q}</h4>
                    <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>
                      expand_more
                    </span>
                  </div>
                  <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                    <div className="overflow-hidden">
                      <p className="text-on-surface-variant text-body-md leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ─── CHECKOUT DIALOG MODAL ─── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={closeCheckout}
              disabled={checkoutStep === 'processing'}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* STEP 1: Card checkout form */}
            {checkoutStep === 'form' && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] font-bold">
                    Checkout Securely
                  </span>
                  <h3 className="text-headline-md font-bold text-on-surface mt-3">Upgrade Subscription</h3>
                  <p className="text-on-surface-variant text-caption mt-1">
                    You are subscribing to <strong className="text-on-surface">{selectedPlan.name}</strong> ({billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}).
                  </p>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">Cardholder Name</label>
                    <input
                      required
                      type="text"
                      value={cardForm.name}
                      onChange={(e) => setCardForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
                      placeholder="Alex Rivera"
                    />
                  </div>

                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        maxLength="19"
                        value={cardForm.number}
                        onChange={(e) => setCardForm((prev) => ({ ...prev, number: e.target.value }))}
                        className="w-full h-12 pl-12 pr-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface"
                        placeholder="4111 2222 3333 4444"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        credit_card
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1">Expiration</label>
                      <input
                        required
                        type="text"
                        maxLength="5"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm((prev) => ({ ...prev, expiry: e.target.value }))}
                        className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface text-center"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1">CVC</label>
                      <input
                        required
                        type="password"
                        maxLength="4"
                        value={cardForm.cvc}
                        onChange={(e) => setCardForm((prev) => ({ ...prev, cvc: e.target.value }))}
                        className="w-full h-12 px-4 border border-outline-variant rounded-xl bg-transparent outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-md text-on-surface text-center"
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold text-label-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                  >
                    Pay ${billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly} Securely
                  </button>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="w-full py-3.5 border border-outline-variant rounded-xl text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Payment processing loading animation */}
            {checkoutStep === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-fadeIn">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
                  <span className="material-symbols-outlined text-primary text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    lock
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-body-lg text-on-surface">Securing Payment Gateway...</h4>
                  <p className="text-on-surface-variant text-caption mt-1">Please do not refresh or close this window.</p>
                </div>
              </div>
            )}

            {/* STEP 3: Payment success transaction display */}
            {checkoutStep === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[36px] font-black animate-bounce">
                    check_circle
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-headline-md text-on-surface">Payment Successful!</h4>
                  <p className="text-on-surface-variant text-body-md mt-2 px-4">
                    Congratulations! Your student profile has been upgraded to <strong>{selectedPlan.name}</strong>. Enjoy priority matching benefits.
                  </p>
                </div>
                <button
                  onClick={closeCheckout}
                  className="w-full py-3.5 bg-secondary text-on-secondary rounded-xl font-bold text-label-md hover:shadow-lg hover:scale-[1.01] transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
