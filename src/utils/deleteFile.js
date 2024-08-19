import path from 'path'
import fs from 'fs'
export const deleteFile = (fullPath) => {
    fs.unlinkSync(path.resolve(fullPath))
}