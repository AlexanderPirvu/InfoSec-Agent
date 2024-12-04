import { Button } from '@radix-ui/themes/dist/cjs/components/button'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'

const RunModulesButton = ({setModuleInfo}) => {
  const [moduleOutput, setModuleOutput] = useState<string>('')

  const runModule = useMutation({
    mutationKey: ['modules'],
    mutationFn: async () => {
      window.api.onModuleOutput((output) => {
        // setModuleOutput(output)
        console.log("Setting module info with " + output)
        setModuleInfo(output)
      })

      await window.api.runModule('password_scanner')
    }
  })

  function buttonClick(e) {
    e.preventDefault()
    runModule.mutateAsync()
  }

  return (
    <>
      <Button m='2' onClick={(e) => buttonClick(e)}>Run Modules</Button>
      {/* <div>{moduleOutput}</div> */}
    </>
  )
}

export default RunModulesButton