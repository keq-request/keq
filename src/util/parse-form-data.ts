/* eslint-disable @typescript-eslint/no-var-requires */
import { Exception } from '~/exception'
import { Blob, File, FormData } from '~/polyfill'


interface Part {
  name: string | null
  headers: Record<string, string>
  body: Buffer
  filename: string | null
  mime: string | null
  readable: boolean
  transferEncoding: string
}

function getFileName(headerValue): string | null {
  // matches either a quoted-string or a token (RFC 2616 section 19.5.1)
  const m = headerValue.match(/\bfilename=("(.*?)"|([^()<>{}[\]@,;:"?=\s/\t]+))($|;\s)/i)
  if (!m) return null

  const match = m[2] || m[3] || ''
  let filename: string = match.substr(Number(match.lastIndexOf('\\')) + 1)
  filename = filename.replace(/%22/g, '"')
  filename = filename.replace(/&#([\d]{4});/g, (_, code) => String.fromCharCode(code))
  return filename
}

export function parseFormData(str: string, boundary: string, encoding = 'utf8'): Promise<FormData> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    const MultipartParser = require('formidable/src/parsers/Multipart')

    const parser = new MultipartParser()

    let part: Part = {
      readable: true,
      headers: {},
      name: null,
      filename: null,
      mime: null,
      transferEncoding: 'binary',
      body: Buffer.from(''),
    }

    let headerField = ''
    let headerValue = ''

    const appendPartToFormData = (): void => {
      if (part.name && part.filename) {
        if (part.body instanceof Blob || part.body instanceof File) {
          formData.append(part.name, part.body, part.filename)
        } else {
          formData.append(part.name, new Blob([part.body]), part.filename)
        }
      } else if (part.name) {
        formData.append(part.name, part.body.toString())
      }
    }

    const dataPropagation = (ctx): void => {
      if (ctx.name === 'partData') {
        part.body = Buffer.concat([part.body, ctx.buffer.slice(ctx.start, ctx.end)])
      }
    }

    parser.on('data', ({ name, buffer, start, end }) => {
      if (name === 'partBegin') {
        part = {
          readable: true,
          headers: {},
          name: null,
          filename: null,
          mime: null,
          transferEncoding: 'binary',
          body: Buffer.from(''),
        }

        headerField = ''
        headerValue = ''
      } else if (name === 'headerField') {
        headerField += buffer.toString(encoding, start, end)
      } else if (name === 'headerValue') {
        headerValue += buffer.toString(encoding, start, end)
      } else if (name === 'headerEnd') {
        headerField = headerField.toLowerCase()
        part.headers[headerField] = headerValue

        // matches either a quoted-string or a token (RFC 2616 section 19.5.1)
        // eslint-disable-next-line no-useless-escape
        const regExp = /\bname=("([^"]*)"|([^\(\)<>@,;:\\"\/\[\]\?=\{\}\s\t/]+))/i
        const m = regExp.exec(headerValue)

        if (headerField === 'content-disposition') {
          if (m) part.name = m[2] || m[3] || ''
          part.filename = getFileName(headerValue)
        } else if (headerField === 'content-type') {
          part.mime = headerValue
        } else if (headerField === 'content-transfer-encoding') {
          part.transferEncoding = headerValue.toLowerCase()
        }

        headerField = ''
        headerValue = ''
      } else if (name === 'headersEnd') {
        switch (part.transferEncoding) {
          case 'binary':
          case '7bit':
          case '8bit': {
            const dataStopPropagation = (ctx): void => {
              if (ctx.name === 'partEnd') {
                parser.off('data', dataPropagation)
                parser.off('data', dataStopPropagation)
                appendPartToFormData()
              }
            }

            parser.on('data', dataPropagation)
            parser.on('data', dataStopPropagation)
            break
          }
          case 'base64': {
            const dataStopPropagation = (ctx): void => {
              if (ctx.name === 'partEnd') {
                part.body = Buffer.from(part.body.toString('ascii'), 'base64')
                parser.off('data', dataPropagation)
                parser.off('data', dataStopPropagation)
                appendPartToFormData()
              }
            }
            parser.on('data', dataPropagation)
            parser.on('data', dataStopPropagation)
            break
          }
          default:
            return reject(new Exception('unknown transfer-encoding'))
        }
      } else if (name === 'end') {
        resolve(formData)
      }
    })

    parser.on('error', error => {
      reject(error)
    })

    parser.initWithBoundary(boundary)
    // const shouldWait = !multipartParser.write(buffer);
    parser.write(Buffer.from(str))
    parser.end()
  })
}
