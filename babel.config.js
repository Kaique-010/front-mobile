module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          componentsOrdemServico: './componentsOrdemServico',
        },
      },
    ],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
}
