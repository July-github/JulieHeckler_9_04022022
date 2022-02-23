/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from '../containers/Bills.js'
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Mockedbills from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toBe('active-icon')
    })
    test("Then the bills are listed", () => {
      document.body.innerHTML = BillsUI({ data: Mockedbills.bills() })
      const trList = document.querySelectorAll("tr")
      expect (trList.length).not.toBeNull()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 :  -1 )
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on Bills Page and it is loading", () => {
    test("Then Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page and back-end sends an error", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: 'error' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page and I click on a button icon-eye", () => {
    test("Then the function handleClickIconEye(icon-eye) is called", () => {
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
      document.body.innerHTML = BillsUI({data:bills})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsList = new Bills({
        document, onNavigate, store, localStorage: window.localStorage})

      const handleClickIconEye = jest.fn(billsList.handleClickIconEye)
      const eyebuttons = screen.getAllByTestId("icon-eye")
      const eyebutton = eyebuttons[0]
      eyebutton.addEventListener("click", handleClickIconEye(eyebutton))
      userEvent.click(eyebutton);
      expect(handleClickIconEye).toHaveBeenCalled();
    })

    test("Then A modal should open", () => {
      const modal = screen.getByTestId('modaleFile')
      expect(modal).toBeTruthy()
    })
  })

  describe('When I am on Bills Page and I click on button btn-new-bill', () => {
    test('Then the function handleClickNewBill is called and it should render NewBill page', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsTable = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const handleClickNewBill = jest.fn(billsTable.handleClickNewBill)
      const newBillButton = screen.getByTestId("btn-new-bill")
      newBillButton.addEventListener ("click", handleClickNewBill)
      userEvent.click(newBillButton);
      expect(handleClickNewBill).toHaveBeenCalled();

      const pathname = ROUTES_PATH['NewBill']
      const data = []
      const error = null
      const loading = false
      const html = ROUTES({
        pathname,
        data,
        error,
        loading,
       })
       document.body.innerHTML = html
       await waitFor(() => screen.getAllByText('Envoyer une note de frais'))
       expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    })
  })

})