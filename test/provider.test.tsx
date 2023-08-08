import * as React from 'react'
import { assert } from 'chai'
import { CountryIdentityProvider } from '../src/provider/CountryIdentityProvider'
import { IdentityPCDArgs } from 'pcd-country-identity'
import { render, screen } from '@testing-library/react'
import { genData } from './utils'
import { ArgumentTypeName } from '@pcd/pcd-types'

describe('CountryIdentityProvider', () => {
  let testData: [bigint, bigint, bigint, bigint]

  it('renders children', () => {
    render(
      <CountryIdentityProvider>
        <div>Test Children</div>
      </CountryIdentityProvider>,
    )

    assert(screen.getByText('Test Children') != null, 'Should not be null')
  })

  it('initializes with logged-out status', () => {
    const { container } = render(
      <CountryIdentityProvider>
        <div>Test Children</div>
      </CountryIdentityProvider>,
    )

    const serializedContextValue = container.getAttribute('data-context-value')

    if (serializedContextValue) {
      const contextValue = JSON.parse(serializedContextValue)
      assert(contextValue.state.status === 'logged-out', 'Should be logged-out')
    }
  })

  before(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('updates state correctly when startReq is called', () => {
    const { container } = render(
      <CountryIdentityProvider>
        <div>Test Children</div>
      </CountryIdentityProvider>,
    )

    const serializedContextValue = container.getAttribute('data-context-value')

    if (serializedContextValue) {
      const contextValue = JSON.parse(serializedContextValue)

      const newState = { status: 'logging-in' }

      const pcdArgs: IdentityPCDArgs = {
        signature: {
          argumentType: ArgumentTypeName.BigInt,
          value: testData[1] + '',
        },
        modulus: {
          argumentType: ArgumentTypeName.BigInt,
          value: testData[2] + '',
        },
        base_message: {
          argumentType: ArgumentTypeName.BigInt,
          value: testData[3] + '',
        },
      }

      // Simulate the login action
      contextValue.startReq({ type: 'login', args: pcdArgs })

      // Access the context value after the action
      const updatedSerializedContextValue =
        container.getAttribute('data-context-value')

      if (updatedSerializedContextValue === null) throw Error

      const updatedContextValue = JSON.parse(updatedSerializedContextValue)

      // Get the updated state and assert
      const updatedState = updatedContextValue.state

      assert(updatedState == newState, 'Should be logging-in')
    }
  })
})
