window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {}
  }
};

;(function(){
  if(typeof window !== 'undefined'){
    var s=document.createElement('script');
    s.src='https://cdn.tailwindcss.com';
    s.defer=true;
    document.head.appendChild(s);
  }
})();
