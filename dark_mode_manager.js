$("#dark-mode-sw").on( "change", function() {
    if ($("#dark-mode-sw input")[0].checked)
      $("html").attr("data-bs-theme", "dark");
    else
      $("html").attr("data-bs-theme", "light");
      
  } );



if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  $("#dark-mode-sw input")[0].checked = true;
  $("html").attr("data-bs-theme", "dark");


}
