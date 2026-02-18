export function validateReading(formData, prevReading, allReadings, editingId = null) {
  const errors = {}

  if (!formData.date) {
    errors.date = 'Укажите дату'
  } else {
    const duplicate = allReadings.find(r => r.date === formData.date && r.id !== editingId)
    if (duplicate) {
      errors.date = 'Показание за эту дату уже существует'
    }
  }

  const t1 = parseFloat(formData.t1Reading)
  const t2 = parseFloat(formData.t2Reading)

  if (isNaN(t1) || formData.t1Reading === '') {
    errors.t1 = 'Введите показание T1'
  } else if (t1 < 0) {
    errors.t1 = 'Показание не может быть отрицательным'
  } else if (prevReading && t1 < prevReading.t1Reading) {
    errors.t1 = `Не может быть меньше предыдущего (${prevReading.t1Reading})`
  }

  if (isNaN(t2) || formData.t2Reading === '') {
    errors.t2 = 'Введите показание T2'
  } else if (t2 < 0) {
    errors.t2 = 'Показание не может быть отрицательным'
  } else if (prevReading && t2 < prevReading.t2Reading) {
    errors.t2 = `Не может быть меньше предыдущего (${prevReading.t2Reading})`
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
