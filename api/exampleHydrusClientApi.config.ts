export type hydrusClientApiConfig = {
    clientAccessKey: string,
    clientApiPort: string,
};

const config: hydrusClientApiConfig = {
    clientAccessKey: '<your client API access key here>',
    clientApiPort: '45869', // 45869 is the default port for the hydrus client api
};

export default config;