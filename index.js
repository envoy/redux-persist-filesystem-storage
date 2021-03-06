/**
* @flow
*/

import RNFetchBlob from 'react-native-fetch-blob'

let options = {
  storagePath: `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`,
  encoding: 'utf8',
  toFileName: (name: string) => name.split(':').join('-'),
  fromFileName: (name: string) => name.split('-').join(':'),
}

const pathForKey = (key: string) => `${options.storagePath}/${options.toFileName(key)}`

const FilesystemStorage = {
  config: (
    customOptions: Object,
  ) => {
    options = {
      ...options,
      ...customOptions,
    }
  },

  setItem: (
    key: string,
    value: string,
    callback?: (error: ?Error) => void,
  ) =>
    RNFetchBlob.fs.exists(options.storagePath)
      .then(exists => 
        exists ? true : RNFetchBlob.fs.mkdir(options.storagePath)
      )
      .then(() => 
        RNFetchBlob.fs.writeFile(pathForKey(key), value, options.encoding)
          .then(() => callback && callback())
          .catch(error => callback && callback(error))
      ),

  getItem: (
    key: string,
    callback: (error: ?Error, result: ?string) => void
  ) =>
    RNFetchBlob.fs.exists(pathForKey(options.toFileName(key)))
      .then(exists => {
        if (exists) {
          return RNFetchBlob.fs.readFile(pathForKey(options.toFileName(key)), options.encoding)
            .then(data => {
              callback && callback(null, data)
              if (!callback) return data
            })
            .catch(error => {
              callback && callback(error)
              if (!callback) throw error
            })
        }
      }),

  removeItem: (
    key: string,
    callback: (error: ?Error) => void,
  ) =>
    RNFetchBlob.fs.exists(pathForKey(options.toFileName(key)))
      .then(exists => {
        if (exists) {
          RNFetchBlob.fs.unlink(pathForKey(options.toFileName(key)))
            .then(() => callback && callback())
            .catch(error => {
              callback && callback(error)
              if (!callback) throw error
            })
        }
      }),

  getAllKeys: (
    callback: (error: ?Error, keys: ?Array<string>) => void,
  ) =>
    RNFetchBlob.fs.exists(options.storagePath)
    .then(exists =>
      exists ? true : RNFetchBlob.fs.mkdir(options.storagePath)
    )
    .then(() =>
      RNFetchBlob.fs.ls(options.storagePath)
        .then(files => files.map(file => options.fromFileName(file)))
        .then(files => {
          callback && callback(null, files)
          if (!callback) return files
        })
    )
    .catch(error => {
      callback && callback(error)
      if (!callback) throw error
    }),
}

export default FilesystemStorage
