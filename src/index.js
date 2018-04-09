import registerServiceWorker from './registerServiceWorker';
registerServiceWorker();
if (module.hot) {
    module.hot.accept();
}