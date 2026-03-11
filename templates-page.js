(function () {
  const pageConfig = window.TEMPLATE_PAGE || window.COMPONENTS_PAGE;
  const ANN_KEY = window.TEMPLATE_PAGE ? 'templates-annotations' : 'components-annotations';
  let shell = null;

  async function init() {
    shell = await initStorybookShell(pageConfig, {
      sidebarRootSelector: '#sidebarRoot',
      mainRootSelector: '#mainRoot',
      gridButtonSelector: '#gridToggle',
    });

    // Use the shared annotation system (FAB + panel)
    initAnnotations(ANN_KEY, {
      groupBy: 'id',
      containerSelector: '.story',
      syncToServer: true,
    });

    initPresentation('.slide');
    initInlineEdit({ storybook: true, shell });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
