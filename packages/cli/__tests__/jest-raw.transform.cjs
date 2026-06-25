// CommonJS 版本，兼容性最好
module.exports = {
  process(src/* string */, filename/* string */) {
    // 直接把源文件文本作为模块导出
    return { code: `module.exports = ${JSON.stringify(src)};` };
  },
};
