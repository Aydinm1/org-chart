import {NextResponse} from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import pool from '../../../../../lib/db'
import jwt from 'jsonwebtoken'
import { UserRow } from '../../../../../lib/db/types'

