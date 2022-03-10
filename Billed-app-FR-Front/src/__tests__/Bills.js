/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import "@testing-library/jest-dom/extend-expect"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from '../containers/Bills.js'
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

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

      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then the bills are listed", () => {
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

      const eyebuttons = screen.getAllByTestId("icon-eye")
      const eyebutton = eyebuttons[0]
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eyebutton))
      eyebutton.addEventListener("click", handleClickIconEye)
      userEvent.click(eyebutton);

      expect(handleClickIconEye).toHaveBeenCalled();

      const modaleFile = screen.getByTestId('modaleFile')
      expect(modaleFile).toBeTruthy()
    })
  })

  describe('When I am on Bills Page and I click on button btn-new-bill', () => {
    afterEach(() => {
      document.body.innerHTML = BillsUI({ data:bills })
    })

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

      const pathname = ROUTES_PATH.NewBill
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

// test d'intégration GET

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("Then fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "jane@doe" }));
      window.onNavigate(ROUTES_PATH.Bills)
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      const spy = jest.spyOn(mockStore, "bills")

      const billsHeader = await screen.getByText("Mes notes de frais")
      const trList = document.querySelectorAll("tr")

      mockStore.bills().list()

      expect(spy).toHaveBeenCalled()
      expect(billsHeader).toBeTruthy()
      expect (trList.length).not.toBeNull()
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "jane@doe"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)

      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)

      expect(message).toBeTruthy()
    })  
  })
})