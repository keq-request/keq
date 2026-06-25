import { expect, test } from '@jest/globals'
import { isFormData } from './is-form-data.js'

test('isFormData', () => {
  const formData = new FormData()

  expect(isFormData(formData)).toBeTruthy()
  expect(isFormData({})).toBeFalsy()
})

