/**
 * 获取图片信息
 * @param {string} src
 * @returns {Promise<unknown>}
 */
export function getImageInfo(src) {
  return new Promise(async (resolve, reject) => {
    uni.getImageInfo(
        {
          src: src,
          success(res) {
            resolve(res)
          },
          error(err) {
            reject(err)
          }
        });
  })
}

/**
 * 获取图片二进制信息
 * @param {string} canvasId
 * @param {number} width
 * @param {number} height
 * @returns {Promise<unknown>}
 */
export function getImageData(canvasId, width, height) {
  return new Promise(async (resolve, reject) => {
    uni.canvasGetImageData({
      canvasId: canvasId,
      x: 0,
      y: 0,
      width: width,
      height: height,
      success(res) {
        resolve(res)
      },
      complete(err) {
        reject(err)
      }
    })
  })
}
