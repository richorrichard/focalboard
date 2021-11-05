// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react'
import {render} from '@testing-library/react'
import {mocked} from 'ts-jest/utils'
import userEvent from '@testing-library/user-event'

import {TestBlockFactory} from '../../test/testBlockFactory'

import '@testing-library/jest-dom'

import {wrapIntl} from '../../testUtils'

import {IPropertyTemplate} from '../../blocks/board'
import mutator from '../../mutator'

import CalendarFullView from './fullCalendar'

// import { CardDetailProvider } from 'components/cardDetail/cardDetailContext'

jest.mock('../../mutator')
const mockedMutator = mocked(mutator, true)

describe('components/calendar/fullCalendar', () => {
    const mockShow = jest.fn()
    const mockAdd = jest.fn()

    const dateDisplayProperty = {
        id: '12345',
        name: 'DateProperty',
        type: 'date',
        options: [],
    } as IPropertyTemplate

    const board = TestBlockFactory.createBoard()

    const view = TestBlockFactory.createBoardView(board)
    view.fields.viewType = 'calendar'
    view.fields.groupById = undefined

    const card = TestBlockFactory.createCard(board)

    const fifth = Date.UTC(2021, 9, 5, 12)
    const twentieth = Date.UTC(2021, 9, 20, 12)
    card.createAt = fifth
    const rObject = {from: twentieth}

    test('return calendar, no date property', () => {
        const {container} = render(
            wrapIntl(
                <CalendarFullView
                    initialDate={new Date(fifth)}
                    board={board}
                    activeView={view}
                    cards={[card]}
                    showCard={mockShow}
                    addCard={mockAdd}
                />,
            ),
        )
        expect(container).toMatchSnapshot()
    })

    test('return calendar, with date property not set', () => {
        board.fields.cardProperties.push(dateDisplayProperty)
        card.fields.properties['12345'] = JSON.stringify(rObject)

        const {container} = render(
            wrapIntl(
                <CalendarFullView
                    initialDate={new Date(fifth)}
                    board={board}
                    activeView={view}
                    cards={[card]}
                    showCard={mockShow}
                    addCard={mockAdd}
                />,
            ),
        )
        expect(container).toMatchSnapshot()
        expect(mockedMutator.changeViewDateDisplayPropertyId).toBeCalled()
    })

    test('return calendar, with date property set, test events', () => {
        board.fields.cardProperties.push(dateDisplayProperty)
        card.fields.properties['12345'] = JSON.stringify(rObject)

        const {container, getByText} = render(
            wrapIntl(
                <CalendarFullView
                    initialDate={new Date(fifth)}
                    board={board}
                    activeView={view}
                    dateDisplayProperty={dateDisplayProperty}
                    cards={[card]}
                    showCard={mockShow}
                    addCard={mockAdd}
                />,
            ),
        )
        expect(container).toMatchSnapshot()

        // test clicking card
        const cardLink = getByText('title')
        expect(cardLink).toBeDefined()
        userEvent.click(cardLink as Element)
        expect(mockShow).toBeCalled()
    })
})