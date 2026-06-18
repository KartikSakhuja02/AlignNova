window.tailwind = window.tailwind || {};
window.tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "surface-container-low": "#f0f3ff",
                "secondary-fixed": "#6ffbbe",
                "on-surface": "#111c2d",
                "on-error": "#ffffff",
                "tertiary": "#684000",
                "on-secondary": "#ffffff",
                "on-secondary-container": "#00714d",
                "on-tertiary-container": "#ffd4a4",
                "on-tertiary": "#ffffff",
                "surface-tint": "#4d44e3",
                "inverse-primary": "#c3c0ff",
                "on-surface-variant": "#464555",
                "on-primary-container": "#dad7ff",
                "secondary-container": "#6cf8bb",
                "surface-dim": "#cfdaf2",
                "on-secondary-fixed-variant": "#005236",
                "on-background": "#111c2d",
                "tertiary-container": "#885500",
                "surface-bright": "#f9f9ff",
                "surface-container-lowest": "#ffffff",
                "surface-container-highest": "#d8e3fb",
                "secondary": "#006c49",
                "on-primary": "#ffffff",
                "surface-container-high": "#dee8ff",
                "inverse-on-surface": "#ecf1ff",
                "primary-fixed": "#e2dfff",
                "primary-container": "#4f46e5",
                "on-tertiary-fixed": "#2a1700",
                "surface-variant": "#d8e3fb",
                "primary-fixed-dim": "#c3c0ff",
                "outline-variant": "#c7c4d8",
                "error": "#ba1a1a",
                "surface-container": "#e7eeff",
                "error-container": "#ffdad6",
                "tertiary-fixed-dim": "#ffb95f",
                "outline": "#777587",
                "background": "#f9f9ff",
                "on-tertiary-fixed-variant": "#653e00",
                "inverse-surface": "#263143",
                "on-primary-fixed-variant": "#3323cc",
                "tertiary-fixed": "#ffddb8",
                "on-secondary-fixed": "#002113",
                "on-error-container": "#93000a",
                "secondary-fixed-dim": "#4edea3",
                "surface": "#f9f9ff",
                "on-primary-fixed": "#0f0069",
                "primary": "#3525cd"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            "spacing": {
                "p-sm": "1rem",
                "margin-page": "2rem",
                "container-max": "1280px",
                "p-md": "1.5rem",
                "p-lg": "2rem",
                "p-xl": "3rem",
                "gutter": "1.5rem"
            },
            "fontFamily": {
                "label-md": ["Plus Jakarta Sans"],
                "headline-md": ["Plus Jakarta Sans"],
                "body-lg": ["Plus Jakarta Sans"],
                "display-lg": ["Plus Jakarta Sans"],
                "body-md": ["Plus Jakarta Sans"],
                "headline-lg": ["Plus Jakarta Sans"],
                "caption": ["Plus Jakarta Sans"],
                "headline-lg-mobile": ["Plus Jakarta Sans"]
            },
            "fontSize": {
                "label-md": ["14px", {"lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "600"}],
                "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "700"}],
                "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                "display-lg": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                "headline-lg": ["32px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "700"}],
                "caption": ["12px", {"lineHeight": "1.4", "fontWeight": "500"}],
                "headline-lg-mobile": ["24px", {"lineHeight": "1.3", "fontWeight": "700"}]
            }
        },
    },
}

;(function(){
  if(typeof window !== 'undefined'){
    var s=document.createElement('script');
    s.src='https://cdn.tailwindcss.com';
    s.defer=true;
    document.head.appendChild(s);
  }
})();
