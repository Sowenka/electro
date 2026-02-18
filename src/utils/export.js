export function exportToJSON(readings, settings) {
  const data = {
    version: 1,
    app: 'Электро',
    exportedAt: new Date().toISOString(),
    readings,
    settings: {
      currentTariff: settings.currentTariff,
      tariffHistory: settings.tariffHistory,
    },
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `electro-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (!data.readings || !Array.isArray(data.readings)) {
          throw new Error('Неверный формат файла: отсутствует массив readings')
        }
        resolve(data)
      } catch (err) {
        reject(new Error('Ошибка чтения файла: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsText(file)
  })
}
