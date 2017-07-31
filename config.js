exports.environment = {
  runCronJobs: false,
  port: 3000,
  type: ''
}

exports.database = {
  host: '',
  port: 3306,
  user: '',
  password: '',
  database: 'xyfir_ads',
  connectionLimit: 100,
  waitForConnections: true
};

exports.keys = {
  xyAccounts: '',
  encrypt: '',
  mailgun: '',
  session: '',
  stripe: '',
  xadid: ''
};

exports.addresses = {
  xyAccounts: '',
  mailgun: {
    domain: '',
    api: ''
  },
  xyAds: ''
};